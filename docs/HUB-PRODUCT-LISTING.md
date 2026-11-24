# QRForge — Hub Product Listing & Release Notes

This document is the source of truth for registering the QRForge browser tool in Doc Sansar Hub. Do not publish the Hub listing until the preview deployment and scan tests are complete.

## Hub product fields

| Hub field | Value |
|---|---|
| Product name | QRForge |
| Slug | `qrforge` |
| Short description | Create, customize and download QR codes for websites, Wi-Fi, UPI payments, contacts, events and more. |
| Product type | Tool |
| Delivery type | Browser |
| Fulfillment | Automatic |
| GitHub repository | `tabhishek0001/qrforge` |
| Release tag | Set only after a stable release is created |
| SKU | `DSH-QRF-001` |
| Initial price | Free (₹0) |
| Free product | Yes |
| Initial status | Draft |
| Visibility | Public only after release checks |
| Featured | No until launch approval |
| Requires licence | No for the static generator |
| Browser launch URL | Configure after the preview/production host is provisioned |

Choose an existing active Hub category that best matches Tools or Utilities. Do not create a duplicate category solely for QRForge.

## Short description

Create, customize and download QR codes for websites, Wi-Fi, UPI payments, contacts, events and more.

## Full description

QRForge is a browser-first QR code studio that makes it simple to create useful, scan-ready QR codes for everyday life and business.

Create QR codes for:
- Website links and plain text
- Wi-Fi network access
- WhatsApp chats, email, phone calls and SMS
- Contact cards (vCard)
- Map locations and calendar events
- UPI payment requests in INR

Customize foreground and background colours, image dimensions and error-correction level. Download your QR code as PNG or SVG, and save reusable configurations in your current browser.

**Privacy-first static generation:** your static QR payload is processed in your browser and is not sent to a QRForge application server. Saved QR entries stay in this browser's local storage.

**Important:** a QR code is only a carrier for information. Always verify the destination or payment recipient before sharing or approving a scan. Wi-Fi QR codes contain the network credentials in their encoded content.

## SEO

- SEO title: QRForge – Free QR Code Generator & Custom QR Studio
- SEO description: Create free QR codes for websites, Wi-Fi, UPI payments, contacts, WhatsApp and events. Customize and download high-quality PNG or SVG QR codes with QRForge.

## Current MVP scope

Implemented in the initial development branch:
- 11 payload types, including UPI
- Browser-side QR matrix generation
- Foreground/background colour controls
- 256, 512 and 1024 pixel exports
- Error-correction levels L, M, Q and H
- PNG and SVG downloads
- Browser-local save/load
- Responsive desktop and mobile workspace
- Low-contrast warning

Not implemented yet:
- Dynamic QR redirects and scan analytics
- User accounts and cloud-synced libraries
- Logo uploads, frames, gradient/pattern styles
- Bulk CSV generation
- PDF export
- Campaigns, API access, team workspaces and subscriptions

Do not advertise features in the second list as available until they are implemented and tested.

## Commercial approach

Keep the static generator genuinely free. Do not expire static QR codes or disable already-generated codes to force an upgrade.

A future paid tier may include dynamic QR destinations, scan analytics, bulk generation, team libraries, campaign management and API access. Pricing should be finalized only after competitor research, infrastructure-cost estimates and an actual subscription/entitlement implementation. Do not list proposed subscription prices as active plans yet.

## Release checklist

- [ ] Review PR and pass JavaScript syntax CI.
- [ ] Test all 11 payload formats with independent QR scanner apps.
- [ ] Test PNG and SVG output at all sizes.
- [ ] Test low-contrast warning and error correction settings.
- [ ] Test keyboard navigation and mobile layout.
- [ ] Test local save/load, delete and storage failure handling.
- [ ] Verify the QR engine CDN dependency loads and provide a clear offline/CDN failure state.
- [ ] Deploy to the isolated preview host.
- [ ] Verify the preview host does not share executable application paths or secrets with Hub.
- [ ] Capture product screenshots from the working preview.
- [ ] Create a stable release tag and exact ZIP asset only after acceptance.
- [ ] Register the product in Hub as Draft, then publish after final review.

## Preview and production hosting

Suggested hostnames, subject to DNS and hosting provisioning:
- Preview: `qrforge-preview.docsansar.com`
- Production: `qrforge.docsansar.com`

This MVP is static HTML/CSS/JS and does not require PHP or a database. It can be served as static files, but the preview host must still be isolated from the Hub application's executable directories and secrets. A separate subdomain alone is not a security boundary.
