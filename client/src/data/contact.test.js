import assert from 'node:assert/strict';
import test from 'node:test';
import { contactDetails, facebookUrl } from './contact.js';

test('existing business contact details and Facebook page are retained', () => {
  assert.equal(contactDetails.email, 'aiconmodconpvtltd@gmail.com');
  assert.equal(contactDetails.phone, '+91 99195 02223');
  assert.equal(facebookUrl, 'https://www.facebook.com/people/AICON/61560353601244/');
});
