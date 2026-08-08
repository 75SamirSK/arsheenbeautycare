# Arsheen Beauty Care

A single-file storefront for Arsheen Beauty Care — a small beauty products shop. The entire site (product catalog, shopping cart, checkout via WhatsApp/UPI, and a shop-owner dashboard) lives in one self-contained `index.html` file, built with plain HTML, CSS, and JavaScript. No build step or framework is used.

## Key features

- Product catalog with categories, browsable and searchable by visitors.
- Shopping cart stored in each visitor's browser (`localStorage`).
- Checkout that emails the order via Formspree and/or opens WhatsApp with a pre-filled order message.
- "Pay Online (UPI)" button that opens the customer's UPI app with the shop's UPI ID and amount pre-filled.
- A password-protected shop-owner dashboard (footer link) for managing products, categories, and settings (Formspree endpoint, UPI ID, WhatsApp number, dashboard passcode) directly from the live site, with changes saved in the browser used to make them.

## Running locally

Since this is a static, single-file site, no build or install step is required. Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

Then visit the printed local URL.

## Deploying

The site deploys as-is: Netlify serves `index.html` at the root. No build command is required.
