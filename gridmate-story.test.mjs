import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languages,translations} from './translations.mjs';
import {gridmateStory} from './gridmate-story.mjs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
test('the owner feature uses the chosen language, a native expandable article and no invented press source',()=>{
 assert.deepEqual(Object.keys(gridmateStory).sort(),languages.map(l=>l.code).sort());
 const fields=[...html.matchAll(/data-i18n="(story[^"]+)"/g)].map(m=>m[1]);
 for(const {code} of languages)for(const key of fields)assert.ok(translations[code][key]?.length,`${code}.${key}`);
 assert.match(html,/id="gridmate-story"/);assert.match(html,/<details><summary data-i18n="storyReadMore"/);
 assert.match(html,/href="#gridmate-story"/);assert.match(html,/datetime="2026-10-25"/);
 assert.ok(html.indexOf('id="gridmate-story"')<html.indexOf('id="gridmate-news"'));
 assert.match(gridmateStory.en.spectators,/if spectators are enabled/);
});
