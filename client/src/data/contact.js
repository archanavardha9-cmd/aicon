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
 * Central international digits-only WhatsApp contact for the website preview
 * and kickoff booking popup actions (10-digit 9670111167 with India code 91).
 */
export const previewBookingWhatsAppNumber = '919670111167';

/**
 * Builds a standard wa.me link with an editable, URL-encoded pre-filled draft.
 */
export function buildWhatsAppUrl(number, message) {
  const digitsOnly = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

