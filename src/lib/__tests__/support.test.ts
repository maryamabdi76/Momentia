import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCard,
  hasContact,
  normalizeCard,
  normalizeEmail,
  normalizeHandle,
  readSupportConfig,
} from '../support.ts';

test('card: 16 digits in any common spelling are accepted, anything else is dropped', () => {
  assert.equal(normalizeCard('1234 5678 9012 3456'), '1234567890123456');
  assert.equal(normalizeCard('1234-5678-9012-3456'), '1234567890123456');
  assert.equal(normalizeCard('۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶'), '1234567890123456');
  assert.equal(normalizeCard('١٢٣٤٥٦٧٨٩٠١٢٣٤٥٦'), '1234567890123456');
  assert.equal(normalizeCard('1234 5678 9012 345'), null);
  assert.equal(normalizeCard('1234 5678 9012 3456 7'), null);
  assert.equal(normalizeCard('abcd efgh ijkl mnop'), null);
  assert.equal(normalizeCard(undefined), null);
  assert.equal(normalizeCard(''), null);
});

test('card: grouped in fours for reading and copying', () => {
  assert.equal(formatCard('1234567890123456'), '1234 5678 9012 3456');
});

test('handles: @name, name and profile links all give the bare username', () => {
  const tg = ['t.me', 'telegram.me'] as const;
  assert.equal(normalizeHandle('@momentia_ir', tg), 'momentia_ir');
  assert.equal(normalizeHandle('momentia_ir', tg), 'momentia_ir');
  assert.equal(normalizeHandle('https://t.me/momentia_ir', tg), 'momentia_ir');
  assert.equal(normalizeHandle('t.me/momentia_ir?start=1', tg), 'momentia_ir');
  assert.equal(normalizeHandle('https://www.instagram.com/momentia.ir/', ['instagram.com']), 'momentia.ir');
  assert.equal(normalizeHandle('has space', tg), null);
  assert.equal(normalizeHandle('ab', tg), null);
  assert.equal(normalizeHandle('   ', tg), null);
  assert.equal(normalizeHandle(undefined, tg), null);
});

test('email: only plain addresses', () => {
  assert.equal(normalizeEmail(' hello@example.ir '), 'hello@example.ir');
  assert.equal(normalizeEmail('hello@example'), null);
  assert.equal(normalizeEmail('not an email'), null);
  assert.equal(normalizeEmail(undefined), null);
});

test('config: nothing set means nothing shown', () => {
  const config = readSupportConfig({});
  assert.deepEqual(config, { email: null, telegram: null, instagram: null, card: null });
  assert.equal(hasContact(config), false);
});

test('config: reads every channel and the donation card', () => {
  const config = readSupportConfig({
    NEXT_PUBLIC_CONTACT_EMAIL: 'hello@example.ir',
    NEXT_PUBLIC_CONTACT_TELEGRAM: '@momentia_ir',
    NEXT_PUBLIC_CONTACT_INSTAGRAM: 'https://instagram.com/momentia.ir',
    NEXT_PUBLIC_DONATION_CARD: '1234 5678 9012 3456',
    NEXT_PUBLIC_DONATION_HOLDER: ' مریم عبدی ',
    NEXT_PUBLIC_DONATION_BANK: 'بلو',
  });
  assert.equal(config.email, 'hello@example.ir');
  assert.equal(config.telegram, 'momentia_ir');
  assert.equal(config.instagram, 'momentia.ir');
  assert.deepEqual(config.card, { number: '1234567890123456', holder: 'مریم عبدی', bank: 'بلو' });
  assert.equal(hasContact(config), true);
});

test('config: a malformed card is not shown, even when the holder is set', () => {
  const config = readSupportConfig({
    NEXT_PUBLIC_DONATION_CARD: '1234',
    NEXT_PUBLIC_DONATION_HOLDER: 'someone',
  });
  assert.equal(config.card, null);
});
