/* ==========================================================================
   TIWANA FARMS — INTERACTIVE BRAND EXPERIENCE, E-COMMERCE & DONATE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHoursStatus();
  initCMSDrawer();
  initProductModals();
  initSeasonalTabs();
  initJourneyStepper();
  initGalleryLightbox();
  initMobileMenu();
  initCheckoutButtons();
  initDonatePage();
  initFaqAccordion();
  initMobileStickyBar();
  trackPageViewEvents();
});

/* 1. Dynamic Store Open / Closed Status */
function initLiveHoursStatus() {
  const statusBannerText = document.getElementById('statusHoursText');
  if (!statusBannerText) return;

  const now = new Date();
  const hour = now.getHours();

  // Farm Hours: Mon - Sun (9 AM to 7 PM)
  const isOpenHour = hour >= 9 && hour < 19;

  if (isOpenHour) {
    statusBannerText.innerHTML = '<span class="status-dot"></span> <strong>OPEN TODAY</strong> (9 AM – 7 PM) • Visit Us at 3316 168 St, Surrey';
  } else {
    statusBannerText.innerHTML = '<span class="status-dot" style="background:#E74C3C;box-shadow:0 0 8px #E74C3C;"></span> <strong>FARM STORE CLOSED NOW</strong> • Reopens Daily 9 AM – 7 PM';
  }
}

/* 2. Interactive Live CMS Drawer */
function initCMSDrawer() {
  const openBtn = document.getElementById('openCmsBtn');
  const closeBtn = document.getElementById('closeCmsBtn');
  const drawer = document.getElementById('cmsDrawer');
  const overlay = document.getElementById('cmsOverlay');

  if (openBtn && drawer && overlay) {
    openBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
    });

    const closeCMS = () => {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeCMS);
    overlay.addEventListener('click', closeCMS);

    const seasonInput = document.getElementById('cmsSeasonInput');
    const seasonBanner = document.getElementById('announcementSeasonText');
    if (seasonInput && seasonBanner) {
      seasonInput.addEventListener('input', (e) => {
        seasonBanner.textContent = e.target.value;
      });
    }

    const hoursSelect = document.getElementById('cmsHoursSelect');
    const statusBannerText = document.getElementById('statusHoursText');
    if (hoursSelect && statusBannerText) {
      hoursSelect.addEventListener('change', (e) => {
        if (e.target.value === 'open') {
          statusBannerText.innerHTML = '<span class="status-dot"></span> <strong>OPEN TODAY (OVERRIDE)</strong> • Visit Us at 3316 168 St, Surrey';
        } else if (e.target.value === 'closed') {
          statusBannerText.innerHTML = '<span class="status-dot" style="background:#E74C3C;box-shadow:0 0 8px #E74C3C;"></span> <strong>FARM STORE CLOSED TODAY</strong> • Surrey, BC';
        } else {
          initLiveHoursStatus();
        }
      });
    }
  }
}

/* 3. Product Quick View Modal */
function initProductModals() {
  const backdrop = document.getElementById('productModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalOrigin = document.getElementById('modalOrigin');
  const closeBtn = document.getElementById('closeModalBtn');

  const productData = {
    'eggs': {
      title: 'Premium Organic Brown Eggs',
      desc: 'Naturally laid by healthy pasture-raised hens in South Surrey. Deep golden yolks, thick shells, and unmatched freshness delivered daily.',
      origin: 'Tiwana Farms Pastures • Surrey, BC',
      image: '/assets/images/user_eggs.jpg'
    },
    'breast': {
      title: 'Marinated Boneless Chicken Breast',
      desc: 'Tender boneless chicken breasts deeply marinated in our proprietary blend of Kashmiri red chilies, garlic, ginger, and aromatic spices.',
      origin: 'Crafted Fresh Daily • Tiwana Meat & Poultry',
      image: '/assets/images/kashmiri_chicken_1775873377642.png'
    },
    'wings': {
      title: 'Kashmiri & Tandoori Marinated Wings',
      desc: 'Succulent jumbo wings coated in rich Punjabi tandoori spices. Perfect for grilling, roasting, or air-frying for gatherings.',
      origin: 'House Specialty • Surrey, BC',
      image: '/assets/images/tandoori_wings_1775873425345.png'
    },
    'thighs': {
      title: 'Marinated Chicken Thighs & Legs',
      desc: 'Juicy bone-in thighs and drumsticks slow-infused with traditional garlic-ginger marinades for maximum flavor retention and tender roast.',
      origin: 'Farm Fresh Specialty • South Surrey',
      image: '/assets/images/marinated_thighs_legs_1775874687829.png'
    },
    'saag': {
      title: 'Tiwana Artisanal Saag Special',
      desc: 'Our iconic slowly-cooked Punjabi farm saag made with mustard greens, spinach, and fresh herbs cooked over open fires. Rich, creamy, and traditional.',
      origin: 'Tiwana Kitchen Recipe • Surrey, BC',
      image: '/assets/images/user_saag.jpg'
    },
    'harvest': {
      title: 'Fraser Valley Seasonal Harvest Basket',
      desc: 'Curated daily selection of crisp heirloom greens, sweet carrots, vine-ripened tomatoes, and fresh root vegetables grown right here in Surrey.',
      origin: 'Surrey Crops • Fraser Valley',
      image: '/assets/images/tiwana_farm_harvest_1789220741305.jpg'
    }
  };

  document.querySelectorAll('[data-product-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-product-id');
      const item = productData[pId];
      if (item && backdrop) {
        modalImg.src = item.image;
        modalTitle.textContent = item.title;
        modalDesc.textContent = item.desc;
        modalOrigin.textContent = item.origin;
        backdrop.classList.add('active');
      }
    });
  });

  if (backdrop && closeBtn) {
    const closeModal = () => backdrop.classList.remove('active');
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
}

/* 4. Seasonal Filter Tabs */
function initSeasonalTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.product-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 5. Farm-to-Table Stepper */
function initJourneyStepper() {
  const steps = document.querySelectorAll('.journey-step');
  steps.forEach(step => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}

/* 6. Lightbox Gallery */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop active';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 900px; background: #0C1E14;">
          <img src="${img.src}" style="width: 100%; max-height: 80vh; object-fit: contain;">
          <button style="position: absolute; top: 15px; right: 20px; color: #FFF; font-size: 2rem; background: none; border: none; cursor: pointer;">&times;</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', () => modal.remove());
    });
  });
}

/* 7. Mobile Menu Toggle */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '86px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0C1E14';
        navLinks.style.padding = '24px';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
      }
    });
  }
}

/* 8. Stripe Checkout & Payment Modal Trigger Handler */
function initCheckoutButtons() {
  document.querySelectorAll('.buy-guide-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Analytics event
      if (window.gtag) {
        window.gtag('event', 'click_buy_kitchen_garden', { product: 'Kitchen Garden Guide', price: 16.99 });
        window.gtag('event', 'begin_checkout', { value: 16.99, currency: 'CAD' });
      }

      openStripePaymentModal({
        type: 'guide',
        amount: 16.99,
        title: 'The Great Canadian Kitchen Garden™ — Digital Edition'
      });
    });
  });
}

/* 9. Donate Page Selection & Checkout Handler */
function initDonatePage() {
  const cards = document.querySelectorAll('.amount-card');
  const customInput = document.getElementById('customDonationInput');
  const contributeBtn = document.getElementById('contributeBtn');

  if (!contributeBtn) return;

  let selectedAmount = 25;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedAmount = parseFloat(card.getAttribute('data-value'));
      if (customInput) customInput.value = '';
    });
  });

  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        cards.forEach(c => c.classList.remove('active'));
        selectedAmount = val;
      }
    });
  }

  contributeBtn.addEventListener('click', () => {
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'begin_donation', { amount: selectedAmount });
    }

    openStripePaymentModal({
      type: 'donate',
      amount: selectedAmount,
      title: 'Support Tiwana Farms Community Initiatives'
    });
  });
}

/* 9.5 Interactive Stripe Payment Modal */
function openStripePaymentModal({ type, amount, title }) {
  // Remove existing modal if any
  const existing = document.getElementById('stripePaymentModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'stripePaymentModal';
  modal.className = 'stripe-modal-backdrop active';
  modal.innerHTML = `
    <div class="stripe-modal-card">
      <button class="stripe-modal-close" id="closeStripeModalBtn">&times;</button>
      
      <div class="stripe-header-badge">
        <span>🔒 SECURE STRIPE CHECKOUT</span> • <span>TIWANA FARMS</span>
      </div>

      <h2 style="font-family:var(--font-serif); font-size:1.8rem; color:var(--color-forest-deep); margin-bottom:4px;">
        Complete Your Payment
      </h2>
      <p style="font-size:0.88rem; color:var(--color-text-muted);">Instant authorization & digital delivery.</p>

      <div class="payment-summary-box">
        <div>
          <div style="font-size:0.8rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:600;">Item</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--color-forest-deep);">${title}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:600;">Total</div>
          <div style="font-family:var(--font-serif); font-size:1.6rem; font-weight:700; color:var(--color-brass-gold);">$${amount.toFixed(2)} CAD</div>
        </div>
      </div>

      <div class="payment-method-tabs">
        <button class="pay-tab-btn active" type="button" data-method="card">💳 Credit / Debit</button>
        <button class="pay-tab-btn" type="button" data-method="paypal">🅿️ PayPal</button>
        <button class="pay-tab-btn" type="button" data-method="applepay">🍎 Apple Pay</button>
      </div>

      <form id="stripePaymentForm">
        <div id="cardFieldsContainer">
          <label class="form-group-label">Cardholder Name</label>
          <input type="text" id="payCardName" class="form-input-field" placeholder="e.g. Gurpreet Singh" required value="Tiwana Customer">

          <label class="form-group-label">Card Number</label>
          <input type="text" id="payCardNumber" class="form-input-field" placeholder="4242 •••• •••• 4242" maxlength="19" required value="4242 4242 4242 4242">

          <div class="form-input-row">
            <div>
              <label class="form-group-label">Expiry (MM/YY)</label>
              <input type="text" id="payCardExpiry" class="form-input-field" placeholder="12/28" maxlength="5" required value="12/28">
            </div>
            <div>
              <label class="form-group-label">CVC / CVV</label>
              <input type="text" id="payCardCvc" class="form-input-field" placeholder="123" maxlength="4" required value="123">
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label class="form-group-label">Postal / Zip Code</label>
            <input type="text" id="payPostalCode" class="form-input-field" placeholder="V3S 9V2" value="V3S 9V2">
          </div>
        </div>

        <button type="submit" class="pay-submit-btn" id="paySubmitBtn">
          AUTHORIZE & PAY CAD $${amount.toFixed(2)}
        </button>

        <div style="text-align:center; font-size:0.78rem; color:var(--color-text-muted); margin-top:16px;" id="paymentTrustNote">
          🔒 Encrypted 256-Bit SSL Payment • Powered by Stripe & PayPal
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  let activeMethod = 'card';
  const payTabs = modal.querySelectorAll('.pay-tab-btn');
  const cardFieldsContainer = modal.querySelector('#cardFieldsContainer');
  const submitBtn = modal.querySelector('#paySubmitBtn');
  const payCardName = modal.querySelector('#payCardName');
  const payCardNumber = modal.querySelector('#payCardNumber');
  const payCardExpiry = modal.querySelector('#payCardExpiry');
  const payCardCvc = modal.querySelector('#payCardCvc');

  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeMethod = tab.getAttribute('data-method');

      if (activeMethod === 'paypal') {
        cardFieldsContainer.style.display = 'none';
        payCardName.removeAttribute('required');
        payCardNumber.removeAttribute('required');
        payCardExpiry.removeAttribute('required');
        payCardCvc.removeAttribute('required');
        submitBtn.textContent = `AUTHORIZE & PAY WITH PAYPAL CAD $${amount.toFixed(2)}`;
      } else if (activeMethod === 'applepay') {
        cardFieldsContainer.style.display = 'none';
        payCardName.removeAttribute('required');
        payCardNumber.removeAttribute('required');
        payCardExpiry.removeAttribute('required');
        payCardCvc.removeAttribute('required');
        submitBtn.textContent = `AUTHORIZE WITH APPLE PAY CAD $${amount.toFixed(2)}`;
      } else {
        cardFieldsContainer.style.display = 'block';
        payCardName.setAttribute('required', 'required');
        payCardNumber.setAttribute('required', 'required');
        payCardExpiry.setAttribute('required', 'required');
        payCardCvc.setAttribute('required', 'required');
        submitBtn.textContent = `AUTHORIZE & PAY CAD $${amount.toFixed(2)}`;
      }
    });
  });

  // Formatting card input
  const cardInput = modal.querySelector('#payCardNumber');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  // Formatting expiry
  const expiryInput = modal.querySelector('#payCardExpiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) {
        e.target.value = v.substring(0, 2) + '/' + v.substring(2);
      } else {
        e.target.value = v;
      }
    });
  }

  // Close handler
  const closeBtn = modal.querySelector('#closeStripeModalBtn');
  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Form Submission
  const form = modal.querySelector('#stripePaymentForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'AUTHORIZING SECURE PAYMENT...';
    submitBtn.disabled = true;

    try {
      let response, result;

      if (activeMethod === 'paypal') {
        response = await fetch('/api/process-paypal-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, amount, orderID: 'PAYPAL_' + Date.now() })
        });
        result = await response.json();
      } else {
        response = await fetch('/api/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            amount,
            cardName: payCardName.value || 'Customer',
            cardNumber: cardInput ? cardInput.value : '4242 4242 4242 4242',
            cardExpiry: expiryInput ? expiryInput.value : '12/28',
            cardCvc: modal.querySelector('#payCardCvc') ? modal.querySelector('#payCardCvc').value : '123'
          })
        });
        result = await response.json();
      }

      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || 'Payment authorization failed.');
        submitBtn.textContent = `AUTHORIZE & PAY CAD $${amount.toFixed(2)}`;
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Error processing payment authorization.');
      submitBtn.textContent = `AUTHORIZE & PAY CAD $${amount.toFixed(2)}`;
      submitBtn.disabled = false;
    }
  });
}

/* 10. FAQ Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const qBtn = item.querySelector('.faq-question');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(fi => {
          fi.classList.remove('active');
          const icon = fi.querySelector('.faq-icon');
          if (icon) icon.textContent = '+';
        });
        if (!isActive) {
          item.classList.add('active');
          const icon = item.querySelector('.faq-icon');
          if (icon) icon.textContent = '−';
        }
      });
    }
  });
}

/* 11. Mobile Sticky Buy Bar */
function initMobileStickyBar() {
  const stickyBar = document.getElementById('mobileStickyBar');
  if (!stickyBar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400 && window.innerWidth <= 768) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  });
}

/* 12. Analytics Event Tracking */
function trackPageViewEvents() {
  if (window.location.pathname.includes('/shop/kitchen-garden-guide')) {
    if (window.gtag) {
      window.gtag('event', 'view_kitchen_garden_product', { product: 'The Great Canadian Kitchen Garden' });
    }
  } else if (window.location.pathname.includes('/donate')) {
    if (window.gtag) {
      window.gtag('event', 'view_donation');
    }
  }
}
