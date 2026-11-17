const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

async function buildPdf() {
  const mdPath = path.join(__dirname, 'Freewheel_Factory_Dashboard_Full_Audit_Report.md');
  const pdfPath = path.join(__dirname, 'Freewheel_Factory_Dashboard_Full_Audit_Report.pdf');

  console.log('Reading markdown report from:', mdPath);
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Convert markdown to HTML
  const htmlBody = marked.parse(mdContent);

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Freewheel Factory Dashboard - Complete Audit Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #71717a;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #18181b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4 {
      color: #09090b;
      font-weight: 700;
      page-break-after: avoid;
    }
    h1 {
      font-size: 19pt;
      border-bottom: 2.5px solid #f97316;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    h2 {
      font-size: 13.5pt;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
      color: #c2410c;
    }
    h3 {
      font-size: 11pt;
      margin-top: 16px;
      margin-bottom: 6px;
      color: #27272a;
    }
    p, li {
      color: #27272a;
    }
    ul, ol {
      margin-top: 4px;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      border: 1px solid #e4e4e7;
      padding: 5.5px 7px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f4f4f5;
      font-weight: 600;
      color: #09090b;
    }
    tr:nth-child(even) td {
      background-color: #fafafa;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      background-color: #f4f4f5;
      color: #c2410c;
      padding: 1px 3px;
      border-radius: 3px;
    }
    pre {
      background-color: #18181b;
      color: #f4f4f5;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 7.5pt;
      line-height: 1.45;
      overflow-x: auto;
      page-break-inside: avoid;
      border-left: 3px solid #f97316;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
    blockquote {
      margin: 12px 0;
      padding: 8px 14px;
      background-color: #fff7ed;
      border-left: 3.5px solid #f97316;
      color: #9a3412;
      font-size: 9pt;
      border-radius: 0 4px 4px 0;
    }
    blockquote p {
      margin: 0;
      color: inherit;
    }
    hr {
      border: none;
      border-top: 1px solid #e4e4e7;
      margin: 18px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .badge-warn { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>
  `;

  console.log('Launching headless browser to compile PDF...');
  const browser = await puppeteer.launch({
    executablePath: '/Users/shyamsv/Desktop/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '15mm',
      right: '15mm'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; font-size: 7.5pt; color: #71717a; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: space-between; padding: 0 15mm;">
        <span>Freewheel Factory — Full Dashboard Audit & Technical Test Report</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();
  console.log('PDF successfully generated at:', pdfPath);
}

buildPdf().catch(err => {
  console.error('PDF Generation Failed:', err);
  process.exit(1);
});
