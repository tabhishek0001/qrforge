# QRForge

**Create. Customize. Connect. Track.**

QRForge is a browser-first QR code studio for creating practical, scan-ready QR codes without requiring an account for basic use.

## MVP scope

- URL, text, email, phone, SMS, WhatsApp, Wi-Fi, UPI payment, vCard, location and calendar event payloads
- Live QR preview
- Foreground/background colors, size, margin and error-correction controls
- PNG and SVG downloads
- Browser-side generation; payloads are not sent to a QRForge server
- Responsive workspace with accessible controls

## Technology

- Static HTML, CSS and JavaScript
- Bootstrap 5 UI
- QRCode.js for QR matrix generation
- Browser Canvas and SVG export

No PHP server or database is required for the static generator. Future account-based and dynamic QR functionality will be added as a separate service layer.

## Run locally

Open `index.html` in a modern browser. For consistent local development, serve this directory with any static HTTP server.

## Security and privacy

- Static QR payload generation happens in the browser.
- Never put passwords, payment secrets or other sensitive data into a public QR code.
- Wi-Fi QR codes contain the network credentials in readable QR payload form.
- QRForge does not claim that a QR code destination is safe; verify destinations before sharing.

## Roadmap

1. Static QR Studio MVP
2. Saved library and bulk CSV generation
3. Dynamic QR redirects and scan analytics
4. Plans, teams and API access

## Status

Initial development on `feature/static-qr-studio-mvp`. The implementation is under review and is not yet production-ready. See `docs/HUB-PRODUCT-LISTING.md` for the Hub listing draft and release checklist.
