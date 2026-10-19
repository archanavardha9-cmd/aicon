function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function createTemplate({ heading, introduction, details, signature }) {
  const rows = Object.entries(details)
    .filter(([, value]) => value)
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaf0;color:#526273;font-size:14px;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e4eaf0;color:#173b63;font-size:14px;white-space:pre-wrap;vertical-align:top">${escapeHtml(value)}</td>
      </tr>`)
    .join('');

  const html = `<!doctype html>
    <html lang="en">
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#292929">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;margin:0 auto;background:#fff;border:1px solid #dce5ee">
          <tr><td style="padding:24px 28px;background:#173b63;color:#fff">
            <p style="margin:0 0 6px;color:#cfe5f8;font-size:11px;letter-spacing:2px;text-transform:uppercase">AICON Smart Appliances</p>
            <h1 style="margin:0;font-size:22px;font-weight:600">${escapeHtml(heading)}</h1>
          </td></tr>
          <tr><td style="padding:26px 28px">
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7">${escapeHtml(introduction)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${rows}</table>
            <p style="margin:23px 0 0;color:#526273;font-size:13px;line-height:1.7">${escapeHtml(signature)}</p>
          </td></tr>
        </table>
      </body>
    </html>`;
  const text = [
    heading,
    '',
    introduction,
    '',
    ...Object.entries(details).filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
    '',
    signature,
  ].join('\n');

  return { html, text };
}

function enquiryDetails(enquiry) {
  return {
    'Enquiry reference': enquiry.id,
    Name: enquiry.name,
    Email: enquiry.email,
    Phone: enquiry.phone,
    Category: enquiry.category,
    Product: enquiry.product,
    Message: enquiry.message,
  };
}

export function createEmailTemplates() {
  return {
    business(enquiry) {
      return {
        subject: `AICON ${enquiry.kind} enquiry · ${enquiry.name}`,
        ...createTemplate({
          heading: 'A new customer enquiry',
          introduction: `A customer submitted a ${enquiry.kind} enquiry through the AICON website.`,
          details: enquiryDetails(enquiry),
          signature: 'Review and respond to this enquiry using your approved customer-service workflow.',
        }),
      };
    },
    customer(enquiry) {
      return {
        subject: 'We received your AICON enquiry',
        ...createTemplate({
          heading: 'Thank you for getting in touch',
          introduction: `Hello ${enquiry.name}, we have received your enquiry. The AICON team will review it and follow up using the contact details you provided.`,
          details: {
            'Enquiry reference': enquiry.id,
            Category: enquiry.category,
            Product: enquiry.product,
            Message: enquiry.message,
          },
          signature: 'AICON Smart Appliances',
        }),
      };
    },
  };
}
