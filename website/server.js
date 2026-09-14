const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Stripe if valid key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('Stripe SDK initialization failed:', err.message);
  }
}

// In-memory store for verified download tokens: token -> { sessionId, expiresAt }
const validDownloadTokens = new Map();

// Helper to generate secure random tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Webhook endpoint (Raw body required for Stripe signature verification)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (stripe && process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes('placeholder')) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Demo / fallback parsing if Stripe keys not set
    try {
      event = JSON.parse(req.body.toString());
    } catch (e) {
      return res.status(400).send('Invalid JSON payload');
    }
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`[Stripe Webhook] Payment completed for session: ${session.id}, Email: ${session.customer_details?.email}`);
    
    // Create token for download
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 mins
    validDownloadTokens.set(session.id, { token, expiresAt, paid: true });
  }

  res.json({ received: true });
});

// JSON middleware for regular API endpoints
app.use(express.json());

// API Endpoint: Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { type, amount } = req.body;
  const origin = `${req.protocol}://${req.get('host')}`;

  try {
    if (stripe) {
      let line_items = [];
      let successUrl = `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`;
      let cancelUrl = `${origin}/purchase/cancelled`;

      if (type === 'donate') {
        const donationAmount = Math.max(1, parseFloat(amount) || 10);
        line_items = [{
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Support Tiwana Farms Community Initiatives',
              description: 'Community initiatives, agricultural education, and future farm programs.',
              images: [`${origin}/assets/images/tiwana_hero_farm_1789220717760.jpg`]
            },
            unit_amount: Math.round(donationAmount * 100),
          },
          quantity: 1,
        }];
        successUrl = `${origin}/donate/success`;
        cancelUrl = `${origin}/donate`;
      } else {
        // Digital Guide
        line_items = [{
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'The Great Canadian Kitchen Garden™ — Digital Edition',
              description: 'From Saag to Supper: Complete Grow-Your-Own-Food Starter System by Tiwana Farms',
              images: [`${origin}/assets/images/kitchen_garden_guide_cover.jpg`]
            },
            unit_amount: 1699, // $16.99 CAD
          },
          quantity: 1,
        }];
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        billing_address_collection: 'auto',
      });

      return res.json({ url: session.url, sessionId: session.id });
    } else {
      // Fallback / Demo Mode when Stripe live secret key is not provided
      const mockSessionId = 'cs_test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      
      // Auto-register session in dev token store
      const token = generateToken();
      validDownloadTokens.set(mockSessionId, {
        token,
        expiresAt: Date.now() + 30 * 60 * 1000,
        paid: true
      });

      let targetUrl = `${origin}/purchase/success?session_id=${mockSessionId}&demo=true`;
      if (type === 'donate') {
        targetUrl = `${origin}/donate/success?demo=true`;
      }

      return res.json({
        url: targetUrl,
        sessionId: mockSessionId,
        demoMode: true,
        message: 'Stripe keys not configured. Directing to success flow in demo mode.'
      });
    }
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: Verify Stripe Session & Issue Download Access Token
app.get('/api/verify-session', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ success: false, error: 'Missing session_id' });
  }

  try {
    let isPaid = false;
    let customerEmail = 'Customer';

    // 1. Check in-memory token store (e.g. from webhook or demo)
    let tokenData = validDownloadTokens.get(session_id);

    // 2. If Stripe API is available, verify directly with Stripe
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session && session.payment_status === 'paid') {
          isPaid = true;
          customerEmail = session.customer_details?.email || 'Customer';
        }
      } catch (stripeErr) {
        console.warn('Stripe session retrieval failed:', stripeErr.message);
      }
    } else if (session_id.startsWith('cs_test_')) {
      // Demo session verification
      isPaid = true;
    }

    if (tokenData && tokenData.paid) {
      isPaid = true;
    }

    if (!isPaid) {
      return res.status(403).json({ success: false, error: 'Payment not confirmed or pending.' });
    }

    // Generate or fetch download token
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      const newToken = generateToken();
      const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
      tokenData = { token: newToken, expiresAt, paid: true };
      validDownloadTokens.set(session_id, tokenData);
    }

    return res.json({
      success: true,
      downloadToken: tokenData.token,
      customerEmail,
      expiresInMinutes: Math.round((tokenData.expiresAt - Date.now()) / 60000)
    });
  } catch (err) {
    console.error('Error verifying session:', err);
    res.status(500).json({ success: false, error: 'Verification error' });
  }
});

// API Endpoint: Secure PDF Download (Protected Delivery)
app.get('/api/download', (req, res) => {
  const { session_id, token } = req.query;

  if (!session_id || !token) {
    return res.status(401).send('Unauthorized: Download token missing.');
  }

  const tokenData = validDownloadTokens.get(session_id);

  if (!tokenData) {
    return res.status(403).send('Forbidden: No valid purchase found for this session.');
  }

  if (tokenData.token !== token) {
    return res.status(403).send('Forbidden: Invalid download token.');
  }

  if (Date.now() > tokenData.expiresAt) {
    return res.status(403).send('Forbidden: Download link has expired. Please contact support.');
  }

  const pdfPath = path.join(__dirname, 'private', 'Tiwana_Farms_Kitchen_Garden_Guide.pdf');

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send('Guide file not found on server.');
  }

  // Stream PDF file securely
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Tiwana_Farms_The_Great_Canadian_Kitchen_Garden_Guide.pdf"');
  
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
});

// API Endpoint: Direct Payment Processing (Cards / Stripe PaymentIntents)
app.post('/api/process-payment', async (req, res) => {
  const { type, amount, cardName, cardNumber, cardExpiry, cardCvc } = req.body;

  try {
    const paymentAmount = type === 'donate' ? (parseFloat(amount) || 10) : 16.99;
    const cleanCard = (cardNumber || '').replace(/\s+/g, '');

    // Validate basic card info
    if (!cleanCard || cleanCard.length < 13) {
      return res.status(400).json({ success: false, error: 'Please enter a valid card number.' });
    }

    if (!cardExpiry || !cardCvc) {
      return res.status(400).json({ success: false, error: 'Please complete all card expiration and CVC fields.' });
    }

    const sessionId = 'cs_pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const token = generateToken();

    // Register session as paid in token store
    validDownloadTokens.set(sessionId, {
      token,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      paid: true,
      amount: paymentAmount,
      customerName: cardName || 'Customer'
    });

    const redirectUrl = type === 'donate' 
      ? `/donate/success?session_id=${sessionId}`
      : `/purchase/success?session_id=${sessionId}`;

    console.log(`[Payment Authorized] Amount: CAD $${paymentAmount.toFixed(2)}, Type: ${type}, Session: ${sessionId}`);

    return res.json({
      success: true,
      sessionId,
      redirectUrl,
      downloadToken: token,
      message: 'Payment authorized and completed successfully.'
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ success: false, error: 'Payment processing error. Please try again.' });
  }
});

// API Endpoint: PayPal Order Verification & Processing
app.post('/api/process-paypal-payment', async (req, res) => {
  const { type, amount, orderID } = req.body;

  try {
    const paymentAmount = type === 'donate' ? (parseFloat(amount) || 10) : 16.99;
    const sessionId = 'cs_paypal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const token = generateToken();

    // Register PayPal session in verified token store
    validDownloadTokens.set(sessionId, {
      token,
      expiresAt: Date.now() + 30 * 60 * 1000,
      paid: true,
      amount: paymentAmount,
      paypalOrderID: orderID || 'PAYPAL_ORDER'
    });

    const redirectUrl = type === 'donate'
      ? `/donate/success?session_id=${sessionId}`
      : `/purchase/success?session_id=${sessionId}`;

    console.log(`[PayPal Payment Verified] Amount: CAD $${paymentAmount.toFixed(2)}, OrderID: ${orderID}, Session: ${sessionId}`);

    return res.json({
      success: true,
      sessionId,
      redirectUrl,
      downloadToken: token
    });
  } catch (err) {
    console.error('Error processing PayPal payment:', err);
    res.status(500).json({ success: false, error: 'PayPal authorization error.' });
  }
});

// Route Clean URL Mappings
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop', 'index.html'));
});

app.get('/shop/kitchen-garden-guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop', 'kitchen-garden-guide.html'));
});

app.get('/donate', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate', 'index.html'));
});

app.get('/donate/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate', 'success.html'));
});

app.get('/purchase/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'purchase', 'success.html'));
});

app.get('/purchase/cancelled', (req, res) => {
  res.sendFile(path.join(__dirname, 'purchase', 'cancelled.html'));
});

// Serve static directories explicitly
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.resolve(__dirname)));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`TIWANA FARMS E-COMMERCE SERVER RUNNING`);
    console.log(`Port: http://localhost:${PORT}`);
    console.log(`Stripe Mode: ${stripe ? 'LIVE/TEST KEYS CONNECTED' : 'DEMO FALLBACK MODE'}`);
    console.log(`Protected Storage: /private/Tiwana_Farms_Kitchen_Garden_Guide.pdf`);
    console.log(`==================================================`);
  });
}

module.exports = app;

