/* Dictionary readings and review candidates. Never replace an existing kana rule. */
(() => {
  const readings=window.OTOWAI_SELECTABLE_READINGS_BY_CHAR || {};
  const candidates={n:'ん',ng:'ん',nia:'にあ',nou:'のう',den:'でん',seng:'せん',lia:'りあ',kei:'けい',m:'む',lo:'ろ',hng:'ふん',len:'れん',dia:'でぃあ',hm:'ふむ',nun:'ぬん',tei:'てい',rua:'るあ','ê':'え',ei:'えい',tunwa:'とぅんわ',fiao:'ふぃあお',zhei:'じぇい',cei:'つぇい',wong:'うぉん',din:'でぃん',biang:'びあん',bong:'ぼん'};
  const key=value=>String(value||'').trim().toLowerCase();
  const chars=value=>String(value||'').split(/[,，]/).map(v=>v.trim()).filter(Boolean);
  const bySound=new Map();
  for(const [char,values] of Object.entries(readings))for(const pinyin of values){
    if(!bySound.has(pinyin))bySound.set(pinyin,[]);
    bySound.get(pinyin).push(char);
  }
  let oldChars=new Set();
  let oldPairs=new Set();
  function expand(rows,baseline) {
    // Baseline is the user's pre-expansion rules, including local corrections.
    oldChars=new Set(baseline.flatMap(row=>chars(row.chars)));
    oldPairs=new Set(baseline.flatMap(row=>chars(row.chars).map(char=>`${char}/${key(row.romaji)}`)));
    const oldSounds=new Set(baseline.map(row=>key(row.romaji)));
    const out=rows.map(row=>({...row,soundStatus:oldSounds.has(key(row.romaji))?'same':row.soundStatus}));
    const byPinyin=new Map(out.map(row=>[key(row.romaji),row]));
    for(const [pinyin,kana] of Object.entries(candidates))if(!byPinyin.has(pinyin)){
      const row={id:`dictionary-${pinyin==='ê'?'e-circumflex':pinyin}`,chars:'',romaji:pinyin,kana,note:'字典补充读音；假名为拟音候选，含少见读音，请校对。',source:'generated',soundStatus:'new',manual:false};
      out.push(row);byPinyin.set(pinyin,row);
    }
    // Only unambiguous new characters join groups automatically. Multi-readings stay separate.
    for(const [pinyin,row] of byPinyin){
      const group=new Set(chars(row.chars));
      for(const char of bySound.get(pinyin)||[])if(readings[char].length===1&&!oldChars.has(char))group.add(char);
      row.chars=[...group].join(',');
    }
    return out;
  }
  function resolve(char,rows,known,choice,context) {
    const options=readings[char]||[];
    const existing=known[char];
    // A saved group for a newly learned polyphone is not a sentence-level reading decision.
    const valid=value=>options.includes(key(value));
    let pinyin=choice ? (valid(choice)?key(choice):null)
      : valid(context?.romaji)?key(context.romaji)
      : existing && valid(existing.romaji) && (oldChars.has(char)||options.length===1)?key(existing.romaji)
      : options.length===1?options[0]:null;
    const matching=pinyin?rows.filter(r=>key(r.romaji)===pinyin):[];
    const row=matching.find(r=>r.manual===true)||matching[0];
    if(!pinyin||!row?.kana.trim())return {pending:true,options};
    return {kana:row.kana.trim(),romaji:pinyin,options,isNew:!oldPairs.has(`${char}/${pinyin}`)||row.soundStatus==='new'};
  }
  function additions(row){return (bySound.get(key(row.romaji))||[]).filter(char=>!oldPairs.has(`${char}/${key(row.romaji)}`));}
  window.OtowaiReadings={expand,resolve,additions,readings};
})();
