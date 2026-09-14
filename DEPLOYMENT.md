# Tiwana Farms — Free Cloud Deployment Guide ($0 Cost)

This guide explains how to deploy the **Tiwana Farms** website and Express backend to **100% FREE cloud platforms** with zero hosting costs.

---

## Option 1: Render.com (100% Free Web Service)

Render offers a **100% Free Tier** supporting Node.js Express servers, Stripe/PayPal environment variables, and protected PDF downloads.

### Step-by-Step Free Render Setup:
1. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploying Tiwana Farms for Free"
   git push origin main
   ```

2. **Create Free Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/) and click **New + -> Web Service**.
   - Connect your GitHub repo (`TFarms`).
   - Fill configuration:
     - **Name**: `tiwana-farms`
     - **Root Directory**: `website`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Select **Free ($0/month)**.

3. **Add Environment Variables**:
   Under the **Environment** tab on Render, add:
   - `PORT` = `8080`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_51RAYYEDVPomNa2v9s8LhijyjTjazuhjeCOD13M3EkfaIrynHZDwsUiPZtluedFDP2IPCwAXKGX8B5vcrUtmMlUd700xrFvt7YX`
   - `PAYPAL_CLIENT_ID` = `BAAXNfGUdGDkw04cdb4DEGvHITG3SezTO7aKTYAyIMC9llST0YnfYTeV5g_Tap-rW8eLUTIRZooPSb-9DM`
   - `PAYPAL_SECRET` = `BAAXNfGUdGDkw04cdb4DEGvHITG3SezTO7aKTYAyIMC9llST0YnfYTeV5g_Tap-rW8eLUTIRZooPSb-9DM`

4. **Connect Custom Domain (`tiwanafarms.com`)**:
   - Go to **Settings -> Custom Domains** in Render.
   - Add `tiwanafarms.com` for free SSL and live publishing.

---

## Option 2: Vercel (100% Free Lifetime Hobby Tier)

Vercel provides ultra-fast free hosting for frontend and Node.js serverless functions.

### Step-by-Step Vercel Setup:
1. Install Vercel CLI or connect via [Vercel Dashboard](https://vercel.com).
2. Run in terminal inside your project directory:
   ```bash
   npx vercel --cwd website
   ```
3. Follow the prompts to publish instantly for $0.
4. Add environment variables in Vercel Dashboard -> **Project Settings -> Environment Variables**.

---

## Option 3: Koyeb / Adaptable.io (Free Cloud Tiers)

Both [Koyeb.com](https://www.koyeb.com/) and [Adaptable.io](https://adaptable.io/) offer free Node.js cloud app hosting with automated git builds and free custom domain SSL certificates.

