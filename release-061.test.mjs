import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { languages, translations } from './translations.mjs';
import { release061Copy } from './gridmate-beta-061.mjs';
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

test('the studio publication has complete localized content in all eighteen languages', () => {
  assert.equal(languages.length, 18);
  assert.deepEqual(Object.keys(release061Copy).sort(), languages.map(l => l.code).sort());
  const newsKeys = [...html.matchAll(/data-i18n="(release[^"]+)"/g)].map(m => m[1]);
  for (const {code} of languages) {
    for (const key of newsKeys) assert.ok(translations[code][key]?.length > 5, `${code}.${key}`);
    assert.equal(translations[code].chessUpdateTitle, release061Copy[code].title);
    assert.match(translations[code].chessStage, /0\.6\.1/);
    assert.equal(translations[code].releaseImageAlt, release061Copy[code].imageAlt);
  }
});
test('canonical videos, current app links, new identity and date are used without autoplay', () => {
  for (const id of ['9WONbmMD38k', 'PYT5FWlty4s', 'cH1cTAK207c']) assert.match(html, new RegExp(`https://www.youtube.com/watch\\?v=${id}`));
  assert.match(html, /https:\/\/www.youtube.com\/@nokegamesCL/);
  assert.match(html, /datetime="2026-10-20"/);
  assert.match(html, /gridmate-061-scene.webp/);
  assert.match(html, /gridmate-061-icon.png/);
  assert.doesNotMatch(html, /gridmate-chess.vercel.app|<iframe|autoplay/);
  for (const asset of ['gridmate-061-scene.webp','gridmate-061-icon.png']) assert.ok(readFileSync(new URL('./'+asset,import.meta.url)).length > 1000);
});
