import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('GridMate keeps its official English slogan while the studio retains its own identity',()=>{
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
 assert.match(html,/<h3>GridMate Chess<\/h3>\s*<p lang="en" dir="ltr">Your Board\. Your Pieces\. Your Game\.<\/p>/);
 assert.ok(!html.includes('Play chess. Anywhere.'));
 assert.ok(html.includes('https://gridmate-chess.pages.dev/'));
 assert.ok(html.includes('gridmate-080-news'));
});
