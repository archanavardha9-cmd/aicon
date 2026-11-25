import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildWhatsAppUrl,
  contactDetails,
  facebookUrl,
  previewBookingWhatsAppNumber,
  projectBrandName,
} from './contact.js';

test('existing business contact details and Facebook page are retained', () => {
  assert.equal(contactDetails.email, 'aiconmodconpvtltd@gmail.com');
  assert.equal(contactDetails.phone, '+91 99195 02223');
  assert.equal(facebookUrl, 'https://www.facebook.com/people/AICON/61560353601244/');
});

test('preview booking WhatsApp configuration and URL builder produce valid wa.me links', () => {
  assert.equal(previewBookingWhatsAppNumber, '919670111167');
  assert.equal(projectBrandName, 'AICON Smart Appliances');

  const url = buildWhatsAppUrl(previewBookingWhatsAppNumber, 'Hello AICON & team');
  assert.equal(url, 'https://wa.me/919670111167?text=Hello%20AICON%20%26%20team');
});
