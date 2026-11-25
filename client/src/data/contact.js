export const contactDetails = {
  companyName: 'AICON Modcon Private Limited',
  cin: 'U46593MH2023PTC416125',
  incorporationDate: '27 December 2023',
  address: 'Shop No. 220, 1st Floor, Building 3, Citi Mall, New Link Road, Andheri (West), Mumbai, Maharashtra 400053',
  phone: '+91 99195 02223',
  phoneSecondary: '+91 99196 02222',
  email: 'aiconmodconpvtltd@gmail.com',
  salesEmail: 'sales@aicon.co.in',
  operatingHours: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
};

export const facebookUrl =
  'https://www.facebook.com/people/AICON/61560353601244/';

export const projectBrandName = 'AICON Smart Appliances';

/**
 * Central feature flag for the website preview and activation popup.
 * Set to `false` after the 50% kickoff payment is confirmed to completely
 * disable the popup, its previews, and its footer scroll trigger across all routes.
 */
export const PROJECT_PREVIEW_POPUP_ENABLED = true;

/**
 * Central international digits-only WhatsApp contact for the website preview
 * and kickoff booking popup actions (10-digit 9670111167 with India code 91).
 */
export const previewBookingWhatsAppNumber = '919670111167';

/**
 * Central preview publication & retention configuration.
 * Update `publicationDate` (ISO YYYY-MM-DD) and `retentionDays` to match
 * the project owner's confirmed preview review window.
 * The deadline is computed deterministically from this fixed date and never resets on page load.
 */
export const previewRetentionPolicy = {
  publicationDate: '2026-11-25',
  retentionDays: 30,
  storageLocation: 'our preview hosting and project storage',
};

/**
 * Computes the fixed calendar deadline string (e.g. "25 December 2026") from a
 * static ISO publicationDate + retentionDays without resetting on page load.
 */
export function getFormattedPreviewDeadline(policy = previewRetentionPolicy) {
  if (!policy?.publicationDate || !Number.isFinite(policy?.retentionDays)) {
    return '';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(policy.publicationDate).trim());
  if (!match) return '';

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const deadlineUtc = new Date(Date.UTC(year, monthIndex, day + policy.retentionDays));

  return deadlineUtc.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Builds a standard wa.me link with an editable, URL-encoded pre-filled draft.
 */
export function buildWhatsAppUrl(number, message) {
  const digitsOnly = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the editable WhatsApp drafts for the website preview popup.
 */
export function buildPreviewWhatsAppDrafts() {
  const activateMessage = `Hi, I’ve reviewed the ${projectBrandName} website preview and would like to discuss activating the business website. I understand that the kickoff payment is 50% of our agreed project fee. Please share the next steps for the remaining development work and launch. Thank you.`;

  const changesMessage = `Hi, I’ve reviewed the ${projectBrandName} website preview. I’d like to request a few changes before proceeding. The changes I’d like are: `;

  return {
    activateMessage,
    changesMessage,
  };
}

