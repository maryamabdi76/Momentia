import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getSiteUrl } from '../site.ts';
import { SHARE_IMAGES, SHARE_IMAGE_SIZE, shareMetadata } from '../share-metadata.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));

test('site url: SITE_URL wins, then the preview URL, then production, then the built-in default', () => {
  assert.equal(getSiteUrl({ SITE_URL: 'https://example.ir/', VERCEL_URL: 'x.vercel.app', VERCEL_ENV: 'preview' }).origin, 'https://example.ir');
  assert.equal(getSiteUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'momentia-git-feat.vercel.app' }).origin, 'https://momentia-git-feat.vercel.app');
  assert.equal(getSiteUrl({ VERCEL_ENV: 'production', VERCEL_URL: 'deploy-1.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'momentia.ir' }).origin, 'https://momentia.ir');
  assert.equal(getSiteUrl({}).origin, 'https://momentia-iota.vercel.app');
  assert.equal(getSiteUrl({ NODE_ENV: 'development' }).origin, 'http://localhost:3000');
});

test('site url: a blank or mistyped SITE_URL falls back instead of breaking every page', () => {
  assert.equal(getSiteUrl({ SITE_URL: '   ' }).origin, 'https://momentia-iota.vercel.app');
  assert.equal(getSiteUrl({ SITE_URL: 'not a url' }).origin, 'https://momentia-iota.vercel.app');
});

test('shareMetadata: Open Graph and Twitter cards carry the same title, description and image', () => {
  const m = shareMetadata({ title: 'ت', description: 'د', image: SHARE_IMAGES.moon, imageAlt: 'الت', siteName: 'س', path: '/moon' });
  assert.equal(m.title, 'ت');
  assert.equal(m.description, 'د');
  assert.deepEqual(m.alternates, { canonical: '/moon' });
  const og = m.openGraph as Record<string, unknown>;
  assert.equal(og.type, 'website');
  assert.equal(og.url, '/moon');
  assert.equal(og.siteName, 'س');
  assert.equal(og.locale, 'fa_IR');
  assert.deepEqual(og.images, [{ url: '/og/moon.jpg', width: 1200, height: 630, alt: 'الت', type: 'image/jpeg' }]);
  const tw = m.twitter as Record<string, unknown>;
  assert.equal(tw.card, 'summary_large_image');
  assert.equal(tw.title, 'ت');
  assert.deepEqual(tw.images, [{ url: '/og/moon.jpg', alt: 'الت' }]);
});

test('shareMetadata: without a path there is no canonical or og:url to inherit by mistake', () => {
  const m = shareMetadata({ title: 'ت', description: 'د', image: SHARE_IMAGES.home, imageAlt: 'ا', siteName: 'س' });
  assert.equal(m.alternates, undefined);
  assert.equal((m.openGraph as Record<string, unknown>).url, undefined);
});

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(file: string) {
  const b = readFileSync(file);
  assert.equal(b.readUInt16BE(0), 0xffd8, `${file} is a JPEG`);
  for (let i = 2; i < b.length - 9; ) {
    assert.equal(b[i], 0xff);
    const marker = b[i + 1]!;
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no frame header in ${file}`);
}

test('every share image exists, is 1200 × 630 and light enough for WhatsApp (< 300 KB)', () => {
  for (const [name, url] of Object.entries(SHARE_IMAGES)) {
    const file = `${root}public${url}`;
    const { width, height } = jpegSize(file);
    assert.deepEqual({ width, height }, SHARE_IMAGE_SIZE, `${name}: size`);
    assert.ok(statSync(file).size < 300 * 1024, `${name}: ${statSync(file).size} bytes`);
  }
});

test('the copy the pages ask for exists', () => {
  const fa = JSON.parse(readFileSync(`${root}messages/fa.json`, 'utf8'));
  for (const text of [
    fa.Metadata.title,
    fa.Metadata.description,
    fa.Metadata.shareImageAlt,
    fa.CreatePage.metaTitle,
    fa.CreatePage.metaDescription,
    fa.MoonPage.metaTitle,
    fa.MoonPage.metaDescription,
    fa.PostersPage.metaTitle,
    fa.PostersPage.description,
  ]) {
    assert.equal(typeof text, 'string');
    assert.ok(text.trim().length > 0);
  }
  // a preview shows roughly the first 150–200 characters
  for (const text of [fa.CreatePage.metaDescription, fa.MoonPage.metaDescription, fa.Metadata.description]) {
    assert.ok(text.length <= 160, text);
  }
});
