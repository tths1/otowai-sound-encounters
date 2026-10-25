/* Versioned, portable backups. Never execute imported content. */
(() => {
  function validate(data, checkConflicts = true) {
    if (data?.format !== 'otowai-rules' || data.version !== 1 || !Array.isArray(data.phoneticRows) || !Array.isArray(data.phraseRows)) throw Error('不是有效的音逢规则备份（版本 1）。');
    const clean = {phoneticRows:[],phraseRows:[]};
    if (data.dictionaryBaseline !== undefined) {
      if (!Array.isArray(data.dictionaryBaseline) || data.dictionaryBaseline.length > 3000 || data.dictionaryBaseline.some(row => !row || typeof row.chars !== 'string' || row.chars.length > 10000 || typeof row.romaji !== 'string' || row.romaji.length > 100 || /[<>\u0000-\u0008]/.test(row.chars + row.romaji))) throw Error('字库校对基线格式不正确。');
      clean.dictionaryBaseline = data.dictionaryBaseline.map(row=>({chars:row.chars,romaji:row.romaji}));
    }
    const sounds = new Map();
    for (const type of ['phoneticRows','phraseRows']) {
      if (data[type].length > 20000) throw Error('规则数量过多。');
      const ids = new Set();
      for (const row of data[type]) {
        if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !/^[\w-]{1,160}$/.test(row.id) || ids.has(row.id)) throw Error('规则编号无效或重复。');
        ids.add(row.id);
        const out = {};
        for (const key of ['id',type==='phoneticRows'?'chars':'phrase','kana','romaji','note','source','soundStatus']) {
          if (row[key] === undefined && ['note','source','soundStatus'].includes(key)) continue;
          if (typeof row[key] !== 'string' || row[key].length > 10000 || /[<>\u0000-\u0008]/.test(row[key])) throw Error('规则字段格式不正确。');
          out[key] = row[key];
        }
        if (row.manual !== undefined) {if(typeof row.manual !== 'boolean')throw Error('规则来源标记无效。');out.manual=row.manual;}
        if (type === 'phoneticRows' && row.romaji.trim() && row.kana.trim()) {
          const key = row.romaji.trim().toLowerCase();
          if (checkConflicts && sounds.has(key) && sounds.get(key) !== row.kana.trim()) throw Error(`拼音 ${key} 有不同假名，请先处理冲突后导入。`);
          sounds.set(key,row.kana.trim());
        }
        clean[type].push(out);
      }
    }
    return clean;
  }
  globalThis.OtowaiBackup = {
    serialize(phoneticRows,phraseRows,dictionaryBaseline) {
      const data={format:'otowai-rules',version:1,exportedAt:new Date().toISOString(),phoneticRows,phraseRows,...(dictionaryBaseline?{dictionaryBaseline}:{})};
      validate(data,false);
      return JSON.stringify(data,null,2);
    },
    parse(text) {
      if(typeof text !== 'string' || text.length>5_000_000)throw Error('备份文件过大。');
      return validate(JSON.parse(text));
    },
  };
})();
