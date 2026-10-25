import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languages,translations} from './translations.mjs';
import {playerRelease071} from './gridmate-beta-071.mjs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
test('current studio news is localized, player-facing and dated after the preserved historical release',()=>{
 assert.deepEqual(Object.keys(playerRelease071).sort(),languages.map(l=>l.code).sort());
 const keys=[...html.matchAll(/data-i18n="(release071[^"]+)"/g)].map(m=>m[1]);
 for(const {code} of languages){for(const key of keys)assert.ok(translations[code][key]?.length>5,`${code}.${key}`);assert.doesNotMatch(JSON.stringify(playerRelease071[code]),/supabase|\bRPC\b|migration|service.role|\bcommit\b|\bbackend\b|provider|\badmin\b/i);}
 assert.ok(html.indexOf('id="gridmate-news"')<html.indexOf('id="gridmate-061-news"'));
 assert.match(html,/datetime="2026-10-25"/);assert.match(html,/GridMate · 0\.7\.1/);
 assert.match(html,/https:\/\/gridmate-chess.pages.dev\/app\/play/);
 for(const c of Object.values(playerRelease071)){assert.ok(c.personalization.includes('10'));assert.ok(c.publicStyles.trim().length>5);}
 assert.doesNotMatch(html,/data-i18n="releaseNext"/);
});
