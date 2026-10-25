import test from 'node:test';
import assert from 'node:assert/strict';
import {toCollectionTtsText} from '../scripts/collection-audio-text.mjs';

test('collection TTS keeps each displayed kana unit explicit', () => {
  assert.equal(
    toCollectionTtsText('さん ちゅう しゃん そん は ， り む えん ちゃい ひ 。'),
    'さん、ちゅう、しゃん、そん、は、り、む、えん、ちゃい、ひ。',
  );
});

test('collection TTS normalizes source punctuation without dropping mora boundaries', () => {
  assert.equal(toCollectionTtsText('ちゅつ ちゅつ ぶん てぃ にゃお 。'), 'ちゅつ、ちゅつ、ぶん、てぃ、にゃお。');
});
