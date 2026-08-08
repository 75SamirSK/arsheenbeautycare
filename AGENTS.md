# AGENTS.md

## Project architecture

This project is a single static HTML file (`index.html`) — the entire Arsheen Beauty Care storefront (catalog, cart, checkout, and shop-owner dashboard) is implemented inline in that one file using plain HTML, CSS, and vanilla JavaScript. There is no build step, framework, bundler, or backend.

## Key directories/files

- `index.html` — the whole site. All markup, styles, and scripts live here inline.
- No `netlify/functions`, no `db/`, no package.json — nothing else is needed for this site to run or deploy.

## Data & persistence

- Product/category/settings data edited through the in-page "Shop owner dashboard" (footer link, passcode-protected) is persisted in the visitor's own browser via `localStorage`. There is no server-side database — dashboard edits made on one device do not sync to other devices/browsers.
- Orders are not stored in a live database. They reach the shop owner via:
  - Email, through a Formspree endpoint configured in the dashboard's Settings tab.
  - WhatsApp, via an auto-filled message link using the WhatsApp number configured in Settings.
- "Pay Online (UPI)" opens the customer's own UPI app with the shop's UPI ID and order amount pre-filled — there is no payment gateway integration.

## Conventions

- Keep the site as a single self-contained `index.html` unless there's a strong reason to introduce a build step — this keeps deployment trivial (drag-and-drop or direct static hosting).
- If persistent, cross-device data storage is ever needed (e.g. a real orders database), use Netlify Database or Netlify Blobs rather than introducing an external service — see the `general-database` skill.
- The dashboard passcode and other shop settings are stored client-side; do not treat them as secure secrets.
