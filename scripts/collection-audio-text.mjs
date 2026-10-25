const SOURCE_PAUSE = new Set(['，', ',', '、', ';', '；']);
const SOURCE_END = new Set(['。', '.', '！', '!', '？', '?']);

/**
 * Convert the displayed, space-separated kana units into an explicit TTS
 * string. The pauses prevent the provider from re-segmenting adjacent units
 * as a Japanese lexical word and changing the intended Chinese-sound mapping.
 */
export function toCollectionTtsText(kana) {
  if (typeof kana !== 'string' || !kana.trim()) throw new TypeError('kana must be a non-empty string');
  const units = kana.trim().split(/\s+/u);
  let output = '';
  for (const unit of units) {
    if (SOURCE_PAUSE.has(unit)) {
      output = output.replace(/、$/u, '') + '、';
    } else if (SOURCE_END.has(unit)) {
      output = output.replace(/、$/u, '') + (unit === '.' ? '。' : unit);
    } else {
      output += (output && !/[、。！？]$/u.test(output) ? '、' : '') + unit;
    }
  }
  return output;
}
