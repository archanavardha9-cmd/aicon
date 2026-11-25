import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPreviewWhatsAppDrafts,
  buildWhatsAppUrl,
  contactDetails,
  facebookUrl,
  getFormattedPreviewDeadline,
  previewBookingWhatsAppNumber,
  previewRetentionPolicy,
  projectBrandName,
} from './contact.js';

test('existing business contact details and Facebook page are retained', () => {
  assert.equal(contactDetails.email, 'aiconmodconpvtltd@gmail.com');
  assert.equal(contactDetails.phone, '+91 99195 02223');
  assert.equal(facebookUrl, 'https://www.facebook.com/people/AICON/61560353601244/');
});

test('preview booking WhatsApp configuration, fixed deadline, and URL builder work', () => {
  assert.equal(previewBookingWhatsAppNumber, '919670111167');
  assert.equal(projectBrandName, 'AICON Smart Appliances');
  assert.equal(previewRetentionPolicy.publicationDate, '2026-11-25');
  assert.equal(previewRetentionPolicy.retentionDays, 30);
  assert.equal(getFormattedPreviewDeadline(), '25 December 2026');

  const url = buildWhatsAppUrl(previewBookingWhatsAppNumber, 'Hello AICON & team');
  assert.equal(url, 'https://wa.me/919670111167?text=Hello%20AICON%20%26%20team');
});

test('preview WhatsApp drafts generate activation and changes-request messages', () => {
  const drafts = buildPreviewWhatsAppDrafts();
  assert.ok(drafts.activateMessage.includes('AICON Smart Appliances'));
  assert.ok(drafts.activateMessage.includes('50% kickoff payment'));
  assert.ok(drafts.changesMessage.includes('AICON Smart Appliances'));
  assert.ok(drafts.changesMessage.endsWith('The changes I’d like are: '));
});
