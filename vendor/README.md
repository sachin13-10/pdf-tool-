Local vendor folder for third-party libraries

What to put here

- pdfkit.standalone.min.js (preferred) or pdfkit.standalone.js, version 0.13.x
  - Source (for manual download):
    - https://cdn.jsdelivr.net/npm/pdfkit@0.13.0/js/pdfkit.standalone.min.js
    - or https://unpkg.com/pdfkit@0.13.0/js/pdfkit.standalone.js
  - Save it into this folder as:
    - pdfkit.standalone.min.js (recommended) or
    - pdfkit.standalone.js
  - Include license notice:
    - PDFKIT-LICENSE.txt (MIT license of PDFKit) is included for compliance.

Why

- The Protect feature needs PDFKit to build encrypted PDFs fully in the browser.
- Loading from here avoids CDN/CSP issues; the page will try these local files first, then fall back to CDNs if not present.

Optional (advanced)

- If you also want to vendor pdf.js to eliminate all CDNs:
  - Download pdf.min.js and pdf.worker.min.js from https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/
  - Update features/protect.html to load local copies and set GlobalWorkerOptions.workerSrc accordingly.

Consent Management (CMP) ID

- To avoid editing every HTML file when you get your Funding Choices ID, you can set it centrally:
  1. Copy cmp-id.example.js to cmp-id.js in this folder.
  2. Edit cmp-id.js and set:
     window.\_\_FC_ID = 'YOUR_FUNDING_CHOICES_ID';
  3. All pages will attempt to load vendor/cmp-id.js at runtime and use this value.
  - If cmp-id.js is missing, pages fall back to the meta fc-id tag in each HTML.

Verification

- After placing the file(s), open features/protect.html. The status should proceed past "Loading encryption engine..." even without network access.
