import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languages,translations} from './translations.mjs';
import {donationCopy,DONATION_LINKS} from './donation-copy.mjs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
test('both donation providers have localized voluntary, reward-free support and qualified privacy notices',()=>{
 assert.deepEqual(Object.keys(donationCopy).sort(),languages.map(l=>l.code).sort());
 for(const {code} of languages)for(const [key,value] of Object.entries(donationCopy[code]))assert.equal(translations[code]['donation'+key[0].toUpperCase()+key.slice(1)],value);
 for(const link of DONATION_LINKS)assert.ok(html.includes(`href="${link.url}" target="_blank" rel="noopener noreferrer"`));
 assert.match(html,/data-i18n="donationNote"/);assert.match(html,/data-i18n="donationPrivacy"/);
 assert.match(html,/data-i18n-aria="donationStreamElements"/);assert.match(html,/data-i18n-aria="donationCeneka"/);
 assert.match(donationCopy.en.note,/no gameplay advantage, visual benefit, cosmetics, GridCoins or rewards/);
 assert.match(donationCopy.en.privacy,/may request or display donor details/);
});
