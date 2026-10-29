import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { languages, translations, applyLanguage } from './translations.mjs';
import { release080Copy } from './gridmate-beta-080.mjs';
import { playerRelease071 } from './gridmate-beta-071.mjs';
import { release061Copy } from './gridmate-beta-061.mjs';
import { donationCopy, DONATION_LINKS, getDonationCopy } from './donation-copy.mjs';

const read = path => readFileSync(new URL(path, import.meta.url));
const html = read('./index.html').toString('utf8');
const article = /<section id="gridmate-080-news"[\s\S]*?<\/section>/.exec(html)?.[0];
const approved = ['en', 'es', 'pt', 'fr', 'de', 'it', 'hr', 'pl', 'cs', 'nl', 'tr', 'ru', 'uk', 'ar', 'hi', 'zh', 'ja', 'ko'];
const fields = ['models', 'zenith', 'style', 'privacy', 'sandbox', 'editor', 'coach', 'challenges', 'pets', 'gore', 'handling', 'survey'];
const prefixed = key => 'release080' + key[0].toUpperCase() + key.slice(1);

test('the separate 0.8.0 module mirrors every field in all 18 languages without changing historical namespaces', () => {
  assert.deepEqual(languages.map(item => item.code), approved);
  assert.deepEqual(Object.keys(release080Copy).sort(), [...approved].sort());
  assert.ok(article);
  assert.deepEqual([...article.matchAll(/<li data-i18n="([^"]+)"/g)].map(match => match[1]), fields.map(prefixed));
  assert.doesNotMatch(article, /release080Academy/); // Same access boundary as the app news.
  for (const code of approved) {
    const copy = release080Copy[code];
    assert.deepEqual(Object.keys(copy), Object.keys(release080Copy.en));
    for (const [key, value] of Object.entries(copy)) {
      assert.equal(typeof value, 'string', `${code}.${key}`);
      assert.ok(value.trim().length > 5, `${code}.${key}`);
      assert.equal(translations[code][prefixed(key)], value);
      if (code !== 'en') assert.notEqual(value, release080Copy.en[key], `${code}.${key}: no English fallback`);
    }
    assert.equal(translations[code].chessUpdateTitle, copy.title);
    assert.equal(translations[code].chessUpdateCopy, copy.body);
    assert.match(translations[code].chessStage, /0\.8\.0/);
    for (const [key, value] of Object.entries(playerRelease071[code])) assert.equal(translations[code]['release071' + key[0].toUpperCase() + key.slice(1)], value);
    assert.equal(translations[code].releaseTitle, release061Copy[code].title);
    assert.equal(translations[code].releaseImageAlt, release061Copy[code].imageAlt);
  }
});

test('header, project milestone and new article use 0.8.0 dated October 29, with older articles preserved', () => {
  assert.match(html, /href="#gridmate-080-news">GridMate · 0\.8\.0<\/a>/);
  const project = /<article class="project-card">[\s\S]*?<\/article>/.exec(html)[0];
  assert.match(project, /Public Beta 0\.8\.0/);
  assert.match(project, /datetime="2026-10-29"/);
  assert.match(article, /BETA 0\.8\.0/);
  assert.match(article, /datetime="2026-10-29"/);
  assert.ok(html.indexOf('id="gridmate-080-news"') < html.indexOf('id="gridmate-news"'));
  assert.ok(html.indexOf('id="gridmate-news"') < html.indexOf('id="gridmate-061-news"'));
  assert.match(html, /BETA 0\.7\.1 · <time datetime="2026-10-25"/);
  assert.match(html, /BETA 0\.6\.1 · <time datetime="2026-10-20"/);
  for (const key of ['title', 'body', ...fields, 'poster']) {
    const matches = [...article.matchAll(new RegExp(`data-i18n="${prefixed(key)}">([^<]+)<`, 'g'))];
    assert.ok(matches.length, key);
    for (const match of matches) assert.equal(match[1], release080Copy.en[key], `${key}: English fallback equals canonical copy`);
  }
});

test('the same English poster is local, responsive and disclosed in each locale', () => {
  const poster = /<img[^>]+src="\/gridmate-080-poster-en\.webp"[^>]+>/.exec(article)?.[0];
  assert.ok(poster);
  assert.match(poster, /width="1122" height="1402" loading="lazy"/);
  assert.match(poster, /data-i18n-alt="release080Poster"/);
  assert.match(article, /<figcaption data-i18n="release080Poster">/);
  const bytes = read('./gridmate-080-poster-en.webp');
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.ok(bytes.length > 10000);
  const disclosure = ['English', 'inglés', 'inglês', 'anglais', 'Englisch', 'inglese', 'engleskom', 'angielskim', 'angličtině', 'Engels', 'İngilizce', 'английском', 'англійською', 'الإنجليزية', 'अंग्रेज़ी', '英文', '英語', '영어'];
  approved.forEach((code, index) => assert.ok(release080Copy[code].poster.includes(disclosure[index]), code));
  assert.doesNotMatch(html, /poster-es|poster-.*spanish/i);
  const css = read('./release-061.css').toString('utf8');
  assert.match(css, /\.studio-release__art\{[^}]*width:100%;height:auto/);
  assert.match(css, /\.studio-release__poster\{margin:24px 0\}/);
});

test('release destinations and all three exact donation links stay explicit and safe', () => {
  const destinations = ['https://gridmate-chess.pages.dev/app/play', 'https://gridmate-chess.pages.dev/app/updates'];
  for (const url of destinations) assert.ok(article.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
  assert.deepEqual(DONATION_LINKS.map(link => link.url), ['https://streamelements.com/nokecl/tip', 'https://ceneka.net/nokecl', 'https://x.la/@nokecl']);
  assert.deepEqual(DONATION_LINKS.map(link => link.id), ['streamElements', 'ceneka', 'xsolla']);
  for (const link of DONATION_LINKS) {
    assert.equal(html.split(`href="${link.url}"`).length - 1, 1);
    assert.ok(html.includes(`href="${link.url}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(html.includes(`data-i18n-aria="donation${link.id[0].toUpperCase() + link.id.slice(1)}"`));
  }
  for (const code of approved) {
    for (const [key, value] of Object.entries(donationCopy[code])) {
      assert.equal(typeof value, 'string');
      assert.ok(value.trim());
      assert.equal(translations[code]['donation' + key[0].toUpperCase() + key.slice(1)], value);
    }
  }
  assert.equal(getDonationCopy('es-CL'), donationCopy.es);
  assert.equal(getDonationCopy('unsupported'), donationCopy.en);
  for (const key of ['note', 'privacy']) assert.ok(html.includes(`data-i18n="donation${key[0].toUpperCase() + key.slice(1)}">${donationCopy.en[key]}<`));
  assert.doesNotMatch(article, /donation|xsolla|x\.la/i); // Optional support is not a release highlight.
});

test('new news and donation copy are byte-identical to the canonical checkout when available', () => {
  // The nested repository also runs standalone; no parent checkout is required.
  for (const [local, canonical] of [
    ['./gridmate-beta-080.mjs', '../../src/i18n/player-release-080.js'],
    ['./donation-copy.mjs', '../../src/i18n/donation-copy.js'],
    ['./gridmate-080-poster-en.webp', '../../public/news/gridmate-080-poster-en.webp'],
  ]) {
    if (existsSync(new URL(canonical, import.meta.url))) assert.deepEqual(read(local), read(canonical), local);
  }
});

function documentFixture() {
  // Attribute-only DOM stand-in; translation behavior is the real exported
  // applyLanguage, not a duplicate of its language/date/RTL implementation.
  const elements = [...html.matchAll(/<([a-z][\w-]*)(?:\s([^<>]*?))?\/?>/gi)].map(match => {
    const attributes = new Map([...String(match[2] ?? '').matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(item => [item[1], item[2] ?? '']));
    return {
      tag: match[1], attributes,
      dataset: Object.fromEntries([...attributes].filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase()), value])),
      getAttribute: key => attributes.get(key) ?? null,
      setAttribute: (key, value) => attributes.set(key, value),
      textContent: '',
    };
  });
  const querySelectorAll = selector => {
    if (selector.startsWith('#')) return elements.filter(element => element.getAttribute('id') === selector.slice(1));
    const match = /^(\w+)?\[([\w-]+)(?:="([^"]+)")?\]$/.exec(selector);
    assert.ok(match, 'known DOM selector: ' + selector);
    return elements.filter(element => (!match[1] || element.tag === match[1]) && element.attributes.has(match[2]) && (!match[3] || element.getAttribute(match[2]) === match[3]));
  };
  return { documentElement: {}, querySelectorAll, querySelector: selector => querySelectorAll(selector)[0] ?? null };
}

test('real language switching renders news, historical articles, English-art disclosure, donation labels and dates in all 18 locales', () => {
  const previousDocument = globalThis.document, previousWindow = globalThis.window;
  const document = documentFixture(), stored = new Map();
  globalThis.document = document;
  globalThis.window = { localStorage: { setItem: (key, value) => stored.set(key, value) } };
  try {
    for (const code of approved) {
      applyLanguage(code, { persist: false });
      assert.equal(document.documentElement.lang, code);
      assert.equal(document.documentElement.dir, code === 'ar' ? 'rtl' : 'ltr');
      for (const element of document.querySelectorAll('[data-i18n]')) assert.equal(element.textContent, translations[code][element.dataset.i18n], `${code}.${element.dataset.i18n}`);
      for (const element of document.querySelectorAll('[data-i18n-alt]')) assert.equal(element.getAttribute('alt'), translations[code][element.dataset.i18nAlt]);
      for (const element of document.querySelectorAll('[data-i18n-aria]')) assert.equal(element.getAttribute('aria-label'), translations[code][element.dataset.i18nAria]);
      for (const element of document.querySelectorAll('time[data-i18n-date]')) {
        const expected = new Intl.DateTimeFormat(code, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(element.getAttribute('datetime') + 'T00:00:00Z'));
        assert.equal(element.textContent, expected);
      }
      assert.equal(document.querySelector('#language-select').value, code);
    }
    assert.equal(stored.size, 0);
    applyLanguage('unsupported');
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(stored.get('nokegames.language'), 'en');
  } finally {
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
});
