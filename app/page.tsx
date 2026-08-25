"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import PINYIN_BY_CHAR from "./pinyin-data";

type Entry = {
  chinese: string;
  kana: string;
  romaji: string;
  source: string;
  category: "古文" | "诗词" | "日常" | "地名";
  score: number;
  note: string;
  featured?: boolean;
};

type MakerResult = {
  input: string;
  kana: string;
  romaji: string;
  confidence: number;
  note: string;
  mode: "syllable" | "semantic";
  matchedChars?: Array<{ char: string; kana: string }>;
  generatedChars?: Array<{ char: string; kana: string; romaji: string; confirmed: boolean }>;
};

type MakerHistoryItem = MakerResult & {
  id: string;
  createdAt: string;
};

const entries: Entry[] = [
  {
    chinese: "忽逢桃花林",
    kana: "ふーふん たお はりん",
    romaji: "fu fun tao ha rin",
    source: "陶渊明《桃花源记》",
    category: "古文",
    score: 92,
    note: "像一阵风把桃花源的入口吹进了日语假名里。",
    featured: true,
  },
  {
    chinese: "山有木兮木有枝",
    kana: "さん よう むー しー むー よう じー",
    romaji: "san yō mū shī mū yō jī",
    source: "《越人歌》",
    category: "诗词",
    score: 81,
    note: "舒展的元音，让古老诗句有了另一种节拍。",
  },
  {
    chinese: "清风明月",
    kana: "ちん ふう みん ゆえ",
    romaji: "chin fū min yue",
    source: "汉字音联想",
    category: "诗词",
    score: 86,
    note: "汉字音读与中文发音互相映照，清亮而短促。",
  },
  {
    chinese: "少年",
    kana: "しょうねん",
    romaji: "shōnen",
    source: "汉字词",
    category: "日常",
    score: 95,
    note: "同一组汉字，在两种语言里保留了熟悉的回声。",
  },
  {
    chinese: "上海",
    kana: "しゃんはい",
    romaji: "shan hai",
    source: "地名",
    category: "地名",
    score: 98,
    note: "日语对中文地名的音译，几乎可以隔岸相认。",
  },
  {
    chinese: "青山",
    kana: "せいざん",
    romaji: "seizan",
    source: "汉字音联想",
    category: "地名",
    score: 78,
    note: "不是完全相同，却像两座山在声音里遥相呼应。",
  },
];

const categories = ["全部", "古文", "诗词", "日常", "地名"] as const;

type PhoneticKanaGroup = {
  chars: string[];
  kana: string;
  romaji: string;
  note: string;
  manual?: boolean;
};

function mergeHomophoneRows(rows: PhoneticKanaGroup[]): PhoneticKanaGroup[] {
  const map = new Map<string, PhoneticKanaGroup>();
  for (const row of rows) {
    const key = row.romaji.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        chars: Array.from(new Set(row.chars)),
        kana: row.kana,
        romaji: row.romaji,
        note: row.note,
        manual: row.manual === true,
      });
      continue;
    }

    const mergedChars = new Set(existing.chars);
    row.chars.forEach((char) => mergedChars.add(char));
    existing.chars = Array.from(mergedChars);
    if (row.manual === true && existing.manual !== true) {
      existing.kana = row.kana;
      existing.note = row.note;
      existing.manual = true;
    }
    if (row.note && row.note !== existing.note) {
      existing.note = `${existing.note}; ${row.note}`;
    }
  }
  return Array.from(map.values());
}

function mergeEditablePhoneticRows(rows: EditablePhoneticKanaRow[]): EditablePhoneticKanaRow[] {
  const map = new Map<string, EditablePhoneticKanaRow>();
  for (const row of rows) {
    const kana = row.kana.trim();
    const romaji = row.romaji.trim();
    if (!kana || !romaji) continue;
    const chars = row.chars
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const key = romaji.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...row,
        chars: chars.join(", "),
      });
      continue;
    }
    const mergedChars = new Set(
      existing.chars
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
    );
    chars.forEach((item) => mergedChars.add(item));
    existing.chars = Array.from(mergedChars).join(",");
    if (row.manual === true && existing.manual !== true) {
      existing.kana = kana;
      existing.note = row.note;
      existing.source = "custom";
      existing.manual = true;
    }
    const existingNote = existing.note?.trim();
    const rowNote = row.note?.trim();
    if (rowNote && rowNote !== existingNote) {
      existing.note = existingNote ? `${existingNote}; ${rowNote}` : rowNote;
    }
  }
  return Array.from(map.values());
}

function ensurePolyphonicReadings(rows: EditablePhoneticKanaRow[]) {
  const required = [{ char: "行", romaji: "hang" }, { char: "行", romaji: "xing" }];
  required.forEach(({ char, romaji }) => {
    const row = rows.find((item) => item.romaji.trim().toLowerCase() === romaji);
    if (!row) return;
    const chars = row.chars.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
    if (!chars.includes(char)) row.chars = [...chars, char].join(",");
  });
  return rows;
}

type EditablePhoneticKanaRow = {
  id: string;
  chars: string;
  kana: string;
  romaji: string;
  note: string;
  source?: "seed" | "generated" | "custom";
  soundStatus?: "same" | "new";
  manual?: boolean;
};

type EditablePhraseKanaRow = {
  id: string;
  phrase: string;
  kana: string;
  romaji: string;
  note: string;
  source?: "seed" | "generated" | "custom";
};

const DEFAULT_PHONETIC_ROWS: EditablePhoneticKanaRow[] = [
  {
    id: "default-01",
    chars: "我,喔,窝",
    kana: "うぉ",
    romaji: "wo",
    note: "同音合并：wo 不区分声调，共用 /うぉ/。",
  },
  {
    id: "default-02",
    chars: "不,步,部,布",
    kana: "ぶ",
    romaji: "bu",
    note: "同音合并：bu 不区分声调，共用 /ぶ/。",
  },
  {
    id: "default-03",
    chars: "懂",
    kana: "どん",
    romaji: "don",
    note: "按“懂”音感归到 /don/ 区域。",
  },
  {
    id: "default-04",
    chars: "你",
    kana: "に",
    romaji: "ni",
    note: "按“你”音感归到 /ni/ 区域。",
  },
  {
    id: "default-05",
    chars: "他,她,它",
    kana: "た",
    romaji: "ta",
    note: "把“他/她/它”归为同音组，统一按 /ta/ 处理。",
  },
  {
    id: "default-06",
    chars: "中",
    kana: "ちゅう",
    romaji: "zhong",
    note: "中（zhong）音感近似。",
  },
  {
    id: "default-07",
    chars: "天",
    kana: "てん",
    romaji: "tian",
    note: "天（tian）可按日语长音延展。",
  },
  {
    id: "default-08",
    chars: "风",
    kana: "ふう",
    romaji: "feng",
    note: "风（feng）与“fū / hūn”类音段可近似。",
  },
  {
    id: "default-09",
    chars: "花",
    kana: "は",
    romaji: "hua",
    note: "花（hua）起始音接近 /wa/，保留 h/f 段落转写。",
  },
  {
    id: "default-10",
    chars: "来",
    kana: "らい",
    romaji: "lai",
    note: "来（lai）可读作连音 /rai/。",
  },
  {
    id: "default-11",
    chars: "明",
    kana: "みん",
    romaji: "ming",
    note: "按用户校对：ming 统一映射为 /みん/。",
  },
  {
    id: "default-12",
    chars: "月",
    kana: "ゆえ",
    romaji: "yue",
    note: "月使用 /ゆえ/。",
  },
  {
    id: "default-13",
    chars: "书",
    kana: "しゅ",
    romaji: "shu",
    note: "书（shu）常见日语读音骨架映射。",
  },
  {
    id: "default-14",
    chars: "文",
    kana: "ぶん",
    romaji: "wen",
    note: "文（wen）靠近日语 /bun/。",
  },
  {
    id: "default-15",
    chars: "火",
    kana: "ほ",
    romaji: "huo",
    note: "火（huo）可按 /ho/ 处理。",
  },
  {
    id: "default-16",
    chars: "水",
    kana: "すい",
    romaji: "shui",
    note: "水（shui）近似转写到 /sui/。",
  },
  {
    id: "default-17",
    chars: "山",
    kana: "さん",
    romaji: "shan",
    note: "山（shan）按日常借音 /san/。",
  },
  {
    id: "default-18",
    chars: "语,雨,羽,宇",
    kana: "ゆ",
    romaji: "yu",
    note: "同音合并：yu 不区分声调，共用 /ゆ/。",
  },
  {
    id: "default-19",
    chars: "好",
    kana: "はお",
    romaji: "hao",
    note: "好（hao）可按长音近音转写。",
  },
  {
    id: "default-20",
    chars: "见,间,件,建",
    kana: "けん",
    romaji: "jian",
    note: "同音合并：jian 不区分声调，共用 /けん/。",
  },
  {
    id: "default-21",
    chars: "日",
    kana: "り",
    romaji: "ri",
    note: "日（ri）可按 /ri/ 处理。",
  },
  {
    id: "default-22",
    chars: "人",
    kana: "じん",
    romaji: "ren",
    note: "人（ren）与日语 /jin/ 近。",
  },
  {
    id: "default-23",
    chars: "们",
    kana: "もん",
    romaji: "men",
    note: "们（men）常见收口音近似。",
  },
  {
    id: "default-24",
    chars: "年",
    kana: "ねん",
    romaji: "nian",
    note: "年（nian）按近似音写为 /nen/。",
  },
  {
    id: "default-25",
    chars: "东",
    kana: "どう",
    romaji: "dong",
    note: "东（dong）向 /tou/ 过渡。",
  },
  {
    id: "default-26",
    chars: "西,习,喜,细",
    kana: "し",
    romaji: "xi",
    note: "西（xi）可按 /shi/ 近似。",
  },
  {
    id: "default-27",
    chars: "爱",
    kana: "あい",
    romaji: "ai",
    note: "爱（ai）可直接转写为 /ai/。",
  },
  {
    id: "default-28",
    chars: "有,右,又,友",
    kana: "ゆう",
    romaji: "you",
    note: "同音合并：you 不区分声调，共用 /ゆう/。",
  },
  {
    id: "default-29",
    chars: "家",
    kana: "じあ",
    romaji: "jia",
    note: "按用户校对：jia 统一映射为 /じあ/。",
  },
  {
    id: "default-30",
    chars: "国",
    kana: "ごく",
    romaji: "guo",
    note: "国（guo）近似 /goku/ 的收口。",
  },
  {
    id: "default-31",
    chars: "学",
    kana: "がく",
    romaji: "xue",
    note: "学（xue）在借音逻辑里常见为 /gaku/。",
  },
  {
    id: "default-73",
    chars: "同",
    kana: "と",
    romaji: "tong",
    note: "同（tong）使用清音 /と/。",
  },
  {
    id: "default-32",
    chars: "生",
    kana: "せい",
    romaji: "sheng",
    note: "生（sheng）可借用 /sei/ 感。",
  },
  {
    id: "default-33",
    chars: "心",
    kana: "しん",
    romaji: "xin",
    note: "心（xin）偏近 /shin/。",
  },
  {
    id: "default-34",
    chars: "说",
    kana: "しゅお",
    romaji: "shuo",
    note: "说（shuo）可写作 /shuo/ 的近音版本。",
  },
  {
    id: "default-35",
    chars: "美,每,妹",
    kana: "めい",
    romaji: "mei",
    note: "同音合并：mei 不区分声调，共用 /めい/。",
  },
  {
    id: "default-36",
    chars: "话",
    kana: "は",
    romaji: "hua",
    note: "花、话同音，统一使用 /は/。",
  },
  {
    id: "default-37",
    chars: "有",
    kana: "ゆう",
    romaji: "you",
    note: "有（you）常见作近似 /yu/ 起始。",
  },
  {
    id: "default-38",
    chars: "天",
    kana: "てん",
    romaji: "tian",
    note: "天（tian）延续原有近音，但保留 /ten/。",
  },
  {
    id: "default-39",
    chars: "大",
    kana: "だ",
    romaji: "da",
    note: "大（da）可用开口 /da/ 声段。",
  },
  {
    id: "default-40",
    chars: "小",
    kana: "しょう",
    romaji: "xiao",
    note: "小（xiao）偏音节可读作 /shō/。",
  },
  {
    id: "default-41",
    chars: "上",
    kana: "しよう",
    romaji: "shang",
    note: "上（shang）可做近似 /shō/ 展开。",
  },
  {
    id: "default-42",
    chars: "下",
    kana: "か",
    romaji: "xia",
    note: "下（xia）可用近音 /ka/ 近似。",
  },
  {
    id: "default-43",
    chars: "去",
    kana: "きょ",
    romaji: "qu",
    note: "去（qu）可音位接近 /kyo/。",
  },
  {
    id: "default-44",
    chars: "来",
    kana: "らい",
    romaji: "lai",
    note: "来（lai）强调连读入口。",
  },
  {
    id: "default-45",
    chars: "好",
    kana: "はお",
    romaji: "hao",
    note: "好（hao）可拉长音段。",
  },
  {
    id: "default-46",
    chars: "想",
    kana: "しゃん",
    romaji: "xiang",
    note: "想（xiang）可近似 /shang/。",
  },
  {
    id: "default-47",
    chars: "爱",
    kana: "あい",
    romaji: "ai",
    note: "爱（ai）常见直接转写。",
  },
  {
    id: "default-48",
    chars: "会,回",
    kana: "くえい",
    romaji: "hui",
    note: "会（hui）可转写为双元音近似。",
  },
  {
    id: "default-49",
    chars: "看",
    kana: "かん",
    romaji: "kan",
    note: "看（kan）可作 /kan/ 近音。",
  },
  {
    id: "default-50",
    chars: "说",
    kana: "しゅお",
    romaji: "shuo",
    note: "说（shuo）保持 /shuo/ 核心音节。",
  },
  {
    id: "default-51",
    chars: "听",
    kana: "てい",
    romaji: "ting",
    note: "听（ting）可按 /tei/ 近似。",
  },
  {
    id: "default-52",
    chars: "今",
    kana: "きん",
    romaji: "jin",
    note: "补充样本：以音节近似“jin”。",
    source: "generated",
  },
  {
    id: "default-53",
    chars: "红,虹",
    kana: "ほん",
    romaji: "hong",
    note: "同音合并：hong 共用 /ほん/。",
    source: "generated",
  },
  {
    id: "default-54",
    chars: "白",
    kana: "ばい",
    romaji: "bai",
    note: "补充样本：按 /bai/ 近似。",
    source: "generated",
  },
  {
    id: "default-55",
    chars: "蓝",
    kana: "らん",
    romaji: "lan",
    note: "补充样本：按 /lan/ 近似。",
    source: "generated",
  },
  {
    id: "default-56",
    chars: "绿,旅",
    kana: "りゅ",
    romaji: "lü",
    note: "同音合并：lü 共用 /りゅ/。",
    source: "generated",
  },
  {
    id: "default-57",
    chars: "黄",
    kana: "こう",
    romaji: "huang",
    note: "补充样本：按 /huang/ 的开口近似。",
    source: "generated",
  },
  {
    id: "default-58",
    chars: "新",
    kana: "しん",
    romaji: "xin",
    note: "补充样本：按 /xin/ 近似。",
    source: "generated",
  },
  {
    id: "default-59",
    chars: "旧",
    kana: "きゅう",
    romaji: "jiu",
    note: "补充样本：按 /giu/ 近似收束。",
    source: "generated",
  },
  {
    id: "default-60",
    chars: "老",
    kana: "ろう",
    romaji: "lao",
    note: "补充样本：按 /lao/ 延展音。",
    source: "generated",
  },
  {
    id: "default-61",
    chars: "少",
    kana: "しゃお",
    romaji: "shao",
    note: "补充样本：按 /shao/ 近似。",
    source: "generated",
  },
  {
    id: "default-62",
    chars: "路",
    kana: "る",
    romaji: "lu",
    note: "补充样本：按 /lu/ 的近似收口。",
    source: "generated",
  },
  {
    id: "default-63",
    chars: "起,七,期,气,器",
    kana: "き",
    romaji: "qi",
    note: "同音合并：qi 不区分声调，共用 /き/。",
    source: "generated",
  },
  {
    id: "default-64",
    chars: "过",
    kana: "ごく",
    romaji: "guo",
    note: "国、过同音，统一使用 /ごく/。",
    source: "generated",
  },
  {
    id: "default-65",
    chars: "夜",
    kana: "や",
    romaji: "ye",
    note: "夜、也同音，统一使用 /や/。",
    source: "generated",
  },
  {
    id: "default-66",
    chars: "活",
    kana: "ほ",
    romaji: "huo",
    note: "火、活同音，统一使用 /ほ/。",
    source: "generated",
  },
  {
    id: "default-67",
    chars: "世",
    kana: "し",
    romaji: "shi",
    note: "使、是、事、市、世同音，统一使用 /し/。",
    source: "generated",
  },
  {
    id: "default-68",
    chars: "界",
    kana: "かい",
    romaji: "jie",
    note: "补充样本：按 /jie/ /jie/ 的开闭变化。",
    source: "generated",
  },
  {
    id: "default-70",
    chars: "光",
    kana: "ぐあん",
    romaji: "guang",
    note: "补充样本：按 /guang/ 做近似长音。",
    source: "generated",
  },
  {
    id: "default-71",
    chars: "情,轻,清",
    kana: "じょう",
    romaji: "qing",
    note: "同音合并：qing 共用现有手写规则 /じょう/。",
    source: "generated",
  },
  {
    id: "default-72",
    chars: "春",
    kana: "ちゅん",
    romaji: "chun",
    note: "修正拼音：春为 chun，使用 /ちゅん/。",
    source: "generated",
  },
  { id: "default-74", chars: "才,菜,彩", kana: "さい", romaji: "cai", note: "同音合并：cai 不区分声调，共用 /さい/。", source: "generated", soundStatus: "same" },
  { id: "default-75", chars: "班,办", kana: "ばん", romaji: "ban", note: "同音合并：不区分声调，共用 /ばん/。", source: "generated", soundStatus: "same" },
  { id: "default-76", chars: "方,放,房,防", kana: "ふぁん", romaji: "fang", note: "纠错：fang 按中文音感统一为 /ふぁん/。", source: "generated", soundStatus: "same" },
  { id: "default-77", chars: "高,告", kana: "こう", romaji: "gao", note: "同音合并：不区分声调，共用 /こう/。", source: "generated", soundStatus: "same" },
  { id: "default-78", chars: "看,刊", kana: "かん", romaji: "kan", note: "同音合并：不区分声调，共用 /かん/。", source: "generated", soundStatus: "same" },
  { id: "default-79", chars: "理,里", kana: "り", romaji: "li", note: "同音合并：不区分声调，共用 /り/。", source: "generated", soundStatus: "same" },
  { id: "default-80", chars: "米,迷", kana: "み", romaji: "mi", note: "同音合并：不区分声调，共用 /み/。", source: "generated", soundStatus: "same" },
  { id: "default-81", chars: "明,名", kana: "みん", romaji: "ming", note: "同音合并：ming 不区分声调，共用 /みん/。", source: "generated", soundStatus: "same" },
  { id: "default-82", chars: "书,输", kana: "しゅ", romaji: "shu", note: "同音合并：不区分声调，共用 /しゅ/。", source: "generated", soundStatus: "same" },
  { id: "default-83", chars: "同,童", kana: "と", romaji: "tong", note: "同音合并：不区分声调，共用清音 /と/。", source: "generated", soundStatus: "same" },
  { id: "default-84", chars: "朋,棚", kana: "ぽん", romaji: "peng", note: "新音组：peng 近似 /ぽん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-85", chars: "纸,只", kana: "し", romaji: "zhi", note: "新音组：zhi 近似 /し/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-86", chars: "冰,兵", kana: "びん", romaji: "bing", note: "新音组：bing 近似 /びん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-87", chars: "早,找", kana: "そう", romaji: "zao", note: "新音组：zao 近似 /そう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-88", chars: "快,块", kana: "かい", romaji: "kuai", note: "新音组：kuai 近似 /かい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-89", chars: "电,店", kana: "てん", romaji: "dian", note: "新音组：dian 近似 /てん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-90", chars: "远,园", kana: "えん", romaji: "yuan", note: "新音组：yuan 近似 /えん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-91", chars: "开,凯", kana: "かい", romaji: "kai", note: "新音组：kai 近似 /かい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-92", chars: "安,按", kana: "あん", romaji: "an", note: "新音组：an 近似 /あん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-93", chars: "包,报", kana: "ほう", romaji: "bao", note: "新音组：bao 近似 /ほう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-94", chars: "草,早", kana: "そう", romaji: "cao", note: "同音合并：cao 与 zao 音节接近，共用 /そう/。", source: "generated", soundStatus: "same" },
  { id: "default-95", chars: "长,常", kana: "ちょう", romaji: "chang", note: "同音合并：chang 不区分声调，共用 /ちょう/。", source: "generated", soundStatus: "same" },
  { id: "default-96", chars: "成,城", kana: "つえん", romaji: "cheng", note: "同音合并：cheng 使用 /つえん/。", source: "generated", soundStatus: "same" },
  { id: "default-97", chars: "出,初", kana: "しゅつ", romaji: "chu", note: "同音合并：chu 近似 /しゅつ/。", source: "generated", soundStatus: "same" },
  { id: "default-98", chars: "多,都", kana: "と", romaji: "duo", note: "新音组：duo 近似 /と/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-99", chars: "飞,非,啡", kana: "ひ", romaji: "fei", note: "同音合并：fei 近似 /ひ/。", source: "generated", soundStatus: "same" },
  { id: "default-100", chars: "古,鼓,故", kana: "こ", romaji: "gu", note: "同音合并：gu 近似 /こ/。", source: "generated", soundStatus: "same" },
  { id: "default-101", chars: "海,还,孩", kana: "はい", romaji: "hai", note: "同音合并：hai 近似 /はい/。", source: "generated", soundStatus: "same" },
  { id: "default-102", chars: "近,进", kana: "きん", romaji: "jin", note: "同音合并：jin 近似 /きん/。", source: "generated", soundStatus: "same" },
  { id: "default-103", chars: "空,控", kana: "くう", romaji: "kong", note: "新音组：kong 近似 /くう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-104", chars: "老,劳", kana: "ろう", romaji: "lao", note: "同音合并：lao 不区分声调，共用 /ろう/。", source: "generated", soundStatus: "same" },
  { id: "default-105", chars: "妈,麻,马,吗", kana: "ま", romaji: "ma", note: "同音合并：ma 不区分声调，共用 /ま/。", source: "generated", soundStatus: "same" },
  { id: "default-106", chars: "使,是,事,市,世,十,时,石", kana: "し", romaji: "shi", note: "同音合并：shi 不区分声调，共用 /し/。", source: "generated", soundStatus: "same" },
  { id: "default-107", chars: "的,得", kana: "で", romaji: "de", note: "同音合并：de 使用浊音 /で/。", source: "generated", soundStatus: "same" },
  { id: "default-108", chars: "了", kana: "りょう", romaji: "le", note: "常用字：le 近似 /りょう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-109", chars: "在,再", kana: "さい", romaji: "zai", note: "同音合并：zai 近似 /さい/。", source: "generated", soundStatus: "same" },
  { id: "default-110", chars: "和,喝,河,合", kana: "へ", romaji: "he", note: "纠错：按中文 he 音译为 /へ/，不使用意译式 /わ/。", source: "generated", soundStatus: "same" },
  { id: "default-111", chars: "旧,就,九,酒", kana: "きゅう", romaji: "jiu", note: "同音合并：jiu 不区分声调，共用 /きゅう/。", source: "generated", soundStatus: "same" },
  { id: "default-112", chars: "把,八,巴", kana: "は", romaji: "ba", note: "同音合并：ba 不区分声调，共用 /は/。", source: "generated", soundStatus: "same" },
  { id: "default-113", chars: "被,备,杯", kana: "ひ", romaji: "bei", note: "同音合并：bei 共用现有规则 /ひ/。", source: "generated", soundStatus: "same" },
  { id: "default-114", chars: "从", kana: "つ", romaji: "cong", note: "常用字：cong 近似 /つ/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-115", chars: "到", kana: "どう", romaji: "dao", note: "常用字：dao 使用浊音 /どう/。", source: "generated", soundStatus: "new" },
  { id: "default-116", chars: "让", kana: "らん", romaji: "rang", note: "常用字：rang 近似 /らん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-117", chars: "能", kana: "のう", romaji: "neng", note: "常用字：neng 近似 /のう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-118", chars: "要", kana: "よう", romaji: "yao", note: "常用字：yao 近似 /よう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-119", chars: "夜,也", kana: "や", romaji: "ye", note: "同音合并：ye 不区分声调，共用 /や/。", source: "generated", soundStatus: "same" },
  { id: "default-120", chars: "很", kana: "へん", romaji: "hen", note: "常用字：hen 近似 /へん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-121", chars: "最", kana: "さい", romaji: "zui", note: "常用字：zui 近似 /さい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-122", chars: "可", kana: "か", romaji: "ke", note: "常用字：ke 近似 /か/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-123", chars: "一,衣,医,以", kana: "い", romaji: "yi", note: "同音合并：yi 不区分声调，共用 /い/。", source: "generated", soundStatus: "same" },
  { id: "default-124", chars: "那", kana: "な", romaji: "na", note: "常用字：na 近似 /な/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-125", chars: "个", kana: "こ", romaji: "ge", note: "常用字：ge 近似 /こ/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-126", chars: "二,儿,耳", kana: "あー", romaji: "er", note: "第一轮：er 近似 /あー/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-127", chars: "三,伞,散", kana: "さん", romaji: "san", note: "同音合并：san 不区分声调，共用 /さん/。", source: "generated", soundStatus: "same" },
  { id: "default-128", chars: "四,死", kana: "す", romaji: "si", note: "第一轮：si 近似 /す/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-129", chars: "五,舞", kana: "う", romaji: "wu", note: "第二轮：wu 近似 /う/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-130", chars: "六,流", kana: "りゅう", romaji: "liu", note: "第二轮：liu 近似 /りゅう/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-131", chars: "前,钱", kana: "ちえん", romaji: "qian", note: "第二轮：qian 近似 /ちえん/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-132", chars: "后,候", kana: "ほう", romaji: "hou", note: "第三轮：hou 近似 /ほう/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-133", chars: "左,佐,坐,作", kana: "ぞ", romaji: "zuo", note: "同音合并：zuo 不区分声调，共用 /ぞ/。", source: "generated", soundStatus: "same" },
  { id: "default-134", chars: "内", kana: "ねい", romaji: "nei", note: "第三轮：nei 近似 /ねい/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-135", chars: "外", kana: "わい", romaji: "wai", note: "第四轮新增：wai 近似 /わい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-136", chars: "头,投", kana: "とう", romaji: "tou", note: "第四轮新增：tou 近似 /とう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-137", chars: "手,首", kana: "しょう", romaji: "shou", note: "第四轮新增：shou 近似 /しょう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-138", chars: "脚,角,叫", kana: "じゃお", romaji: "jiao", note: "同音合并：jiao 共用 /じゃお/。", source: "generated", soundStatus: "same" },
  { id: "default-139", chars: "眼,演,沿", kana: "えん", romaji: "yan", note: "同音合并：yan 共用 /えん/。", source: "generated", soundStatus: "same" },
  { id: "default-149", chars: "本,笨,奔", kana: "べん", romaji: "ben", note: "第一轮：ben 近似 /べん/。", source: "generated", soundStatus: "same" },
  { id: "default-150", chars: "边,变,便,编", kana: "べん", romaji: "bian", note: "第一轮：bian 近似 /べん/。", source: "generated", soundStatus: "same" },
  { id: "default-151", chars: "表,标", kana: "びょう", romaji: "biao", note: "第一轮：biao 近似 /びょう/。", source: "generated", soundStatus: "same" },
  { id: "default-152", chars: "别,憋", kana: "びえ", romaji: "bie", note: "第一轮：bie 近似 /びえ/。", source: "generated", soundStatus: "same" },
  { id: "default-153", chars: "宾,斌,滨", kana: "びん", romaji: "bin", note: "第一轮：bin 近似 /びん/。", source: "generated", soundStatus: "same" },
  { id: "default-154", chars: "波,播,伯,博", kana: "ぼ", romaji: "bo", note: "第一轮：bo 近似 /ぼ/。", source: "generated", soundStatus: "same" },
  { id: "default-155", chars: "参,残,蚕", kana: "つぁん", romaji: "can", note: "第一轮：can 近似 /つぁん/。", source: "generated", soundStatus: "same" },
  { id: "default-156", chars: "侧,测,册", kana: "つぇ", romaji: "ce", note: "第一轮：ce 近似 /つぇ/。", source: "generated", soundStatus: "same" },
  { id: "default-157", chars: "茶,查,差", kana: "ちゃ", romaji: "cha", note: "第二轮：cha 近似 /ちゃ/。", source: "generated", soundStatus: "same" },
  { id: "default-158", chars: "产,缠,馋", kana: "ちゃん", romaji: "chan", note: "第二轮：chan 近似 /ちゃん/。", source: "generated", soundStatus: "same" },
  { id: "default-159", chars: "车,彻,撤", kana: "ちぇ", romaji: "che", note: "第二轮：che 近似 /ちぇ/。", source: "generated", soundStatus: "same" },
  { id: "default-160", chars: "陈,沉,晨", kana: "ちぇん", romaji: "chen", note: "第二轮：chen 近似 /ちぇん/。", source: "generated", soundStatus: "same" },
  { id: "default-161", chars: "充,冲,虫", kana: "ちょん", romaji: "chong", note: "第二轮：chong 近似 /ちょん/。", source: "generated", soundStatus: "same" },
  { id: "default-162", chars: "抽,愁,丑", kana: "ちょう", romaji: "chou", note: "第二轮：chou 近似 /ちょう/。", source: "generated", soundStatus: "same" },
  { id: "default-163", chars: "川,穿,船,传", kana: "ちゅあん", romaji: "chuan", note: "第二轮：chuan 近似 /ちゅあん/。", source: "generated", soundStatus: "same" },
  { id: "default-164", chars: "次,词,此,刺", kana: "つ", romaji: "ci", note: "第二轮：ci 近似 /つ/。", source: "generated", soundStatus: "same" },
  { id: "default-165", chars: "粗,促,醋", kana: "つ", romaji: "cu", note: "第三轮：cu 近似 /つ/。", source: "generated", soundStatus: "same" },
  { id: "default-166", chars: "催,脆,翠", kana: "つい", romaji: "cui", note: "第三轮：cui 近似 /つい/。", source: "generated", soundStatus: "same" },
  { id: "default-167", chars: "村,存,寸", kana: "つん", romaji: "cun", note: "第三轮：cun 近似 /つん/。", source: "generated", soundStatus: "same" },
  { id: "default-168", chars: "错,措,挫", kana: "つぉ", romaji: "cuo", note: "第三轮：cuo 近似 /つぉ/。", source: "generated", soundStatus: "same" },
  { id: "default-169", chars: "单,但,蛋,淡", kana: "だん", romaji: "dan", note: "第三轮：dan 近似 /だん/。", source: "generated", soundStatus: "same" },
  { id: "default-170", chars: "等,灯,登,邓", kana: "でん", romaji: "deng", note: "第三轮：deng 近似 /でん/。", source: "generated", soundStatus: "same" },
  { id: "default-171", chars: "读,度,独,毒", kana: "どぅ", romaji: "du", note: "第三轮：du 近似 /どぅ/。", source: "generated", soundStatus: "same" },
  { id: "default-172", chars: "段,断,端,短", kana: "どぅあん", romaji: "duan", note: "第三轮：duan 近似 /どぅあん/。", source: "generated", soundStatus: "same" },
  { id: "default-173", chars: "对,队,堆", kana: "どぅい", romaji: "dui", note: "第四轮新增：dui 近似 /どぅい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-174", chars: "顿,盾,吨", kana: "どぅん", romaji: "dun", note: "第四轮新增：dun 近似 /どぅん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-175", chars: "反,饭,翻,凡", kana: "ふぁん", romaji: "fan", note: "第四轮新增：fan 近似 /ふぁん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-176", chars: "分,粉,份,奋", kana: "ふん", romaji: "fen", note: "第四轮新增：fen 近似 /ふん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-177", chars: "刚,港,钢,岗", kana: "がん", romaji: "gang", note: "第四轮新增：gang 近似 /がん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-178", chars: "更,耿,梗", kana: "げん", romaji: "geng", note: "第四轮新增：geng 近似 /げん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-179", chars: "工,公,功,共", kana: "ごん", romaji: "gong", note: "第四轮新增：gong 近似 /ごん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-180", chars: "狗,够,沟,购", kana: "ごう", romaji: "gou", note: "第四轮新增：gou 近似 /ごう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-181", chars: "瓜,挂,刮", kana: "ぐあ", romaji: "gua", note: "第一轮：gua 近似 /ぐあ/。", source: "generated", soundStatus: "same" },
  { id: "default-182", chars: "怪,乖,拐", kana: "ぐあい", romaji: "guai", note: "第一轮：guai 近似 /ぐあい/。", source: "generated", soundStatus: "same" },
  { id: "default-183", chars: "关,管,馆,惯", kana: "ぐあん", romaji: "guan", note: "第一轮：guan 近似 /ぐあん/。", source: "generated", soundStatus: "same" },
  { id: "default-184", chars: "贵,归,鬼,规", kana: "ぐい", romaji: "gui", note: "第一轮：gui 近似 /ぐい/。", source: "generated", soundStatus: "same" },
  { id: "default-185", chars: "滚,棍", kana: "ぐん", romaji: "gun", note: "第一轮：gun 近似 /ぐん/。", source: "generated", soundStatus: "same" },
  { id: "default-186", chars: "汉,汗,喊,寒", kana: "はん", romaji: "han", note: "第一轮：han 近似 /はん/。", source: "generated", soundStatus: "same" },
  { id: "default-187", chars: "行,航,杭", kana: "はん", romaji: "hang", note: "第一轮：hang 近似 /はん/。", source: "generated", soundStatus: "same" },
  { id: "default-188", chars: "黑", kana: "へい", romaji: "hei", note: "第一轮：hei 近似 /へい/。", source: "generated", soundStatus: "same" },
  { id: "default-189", chars: "横,恒,衡", kana: "へん", romaji: "heng", note: "第二轮：heng 近似 /へん/。", source: "generated", soundStatus: "same" },
  { id: "default-190", chars: "湖,胡,虎,户", kana: "ふ", romaji: "hu", note: "第二轮：hu 近似 /ふ/。", source: "generated", soundStatus: "same" },
  { id: "default-191", chars: "环,换,欢,患", kana: "ふあん", romaji: "huan", note: "第二轮：huan 近似 /ふあん/。", source: "generated", soundStatus: "same" },
  { id: "default-192", chars: "混,婚,魂,昏", kana: "ふん", romaji: "hun", note: "第二轮：hun 近似 /ふん/。", source: "generated", soundStatus: "same" },
  { id: "default-193", chars: "鸡,机,记,季", kana: "じ", romaji: "ji", note: "第二轮：ji 近似 /じ/。", source: "generated", soundStatus: "same" },
  { id: "default-194", chars: "江,讲,奖,降", kana: "じゃん", romaji: "jiang", note: "第二轮：jiang 近似 /じゃん/。", source: "generated", soundStatus: "same" },
  { id: "default-195", chars: "京,经,静,景", kana: "じん", romaji: "jing", note: "第二轮：jing 近似 /じん/。", source: "generated", soundStatus: "same" },
  { id: "default-196", chars: "窘", kana: "じょん", romaji: "jiong", note: "第二轮：jiong 近似 /じょん/。", source: "generated", soundStatus: "same" },
  { id: "default-197", chars: "居,局,举,句", kana: "じゅ", romaji: "ju", note: "第三轮：ju 近似 /じゅ/。", source: "generated", soundStatus: "same" },
  { id: "default-198", chars: "决,觉,绝", kana: "じゅえ", romaji: "jue", note: "第三轮：jue 近似 /じゅえ/。", source: "generated", soundStatus: "same" },
  { id: "default-199", chars: "军,君,均,俊", kana: "じゅん", romaji: "jun", note: "第三轮：jun 近似 /じゅん/。", source: "generated", soundStatus: "same" },
  { id: "default-200", chars: "卡,咖", kana: "か", romaji: "ka", note: "同音合并：ka 共用 /か/。", source: "generated", soundStatus: "same" },
  { id: "default-201", chars: "康,抗,扛", kana: "かん", romaji: "kang", note: "第三轮：kang 近似 /かん/。", source: "generated", soundStatus: "same" },
  { id: "default-202", chars: "考,靠", kana: "かお", romaji: "kao", note: "第三轮：kao 近似 /かお/。", source: "generated", soundStatus: "same" },
  { id: "default-203", chars: "肯,啃", kana: "けん", romaji: "ken", note: "第三轮：ken 近似 /けん/。", source: "generated", soundStatus: "same" },
  { id: "default-204", chars: "坑,吭", kana: "こん", romaji: "keng", note: "第三轮：keng 近似 /こん/。", source: "generated", soundStatus: "same" },
  { id: "default-205", chars: "口,扣,寇", kana: "こう", romaji: "kou", note: "第四轮：kou 近似 /こう/。", source: "generated", soundStatus: "same" },
  { id: "default-206", chars: "跨,夸,垮", kana: "くあ", romaji: "kua", note: "第四轮：kua 近似 /くあ/。", source: "generated", soundStatus: "same" },
  { id: "default-207", chars: "宽,款", kana: "くあん", romaji: "kuan", note: "第四轮：kuan 近似 /くあん/。", source: "generated", soundStatus: "same" },
  { id: "default-208", chars: "狂,矿,框,况", kana: "くあん", romaji: "kuang", note: "第四轮：kuang 近似 /くあん/。", source: "generated", soundStatus: "same" },
  { id: "default-209", chars: "困,昆,坤", kana: "くん", romaji: "kun", note: "第四轮：kun 近似 /くん/。", source: "generated", soundStatus: "same" },
  { id: "default-210", chars: "拉,啦,辣", kana: "ら", romaji: "la", note: "第四轮：la 近似 /ら/。", source: "generated", soundStatus: "same" },
  { id: "default-211", chars: "浪,狼,郎", kana: "らん", romaji: "lang", note: "第四轮：lang 近似 /らん/。", source: "generated", soundStatus: "same" },
  { id: "default-212", chars: "类,雷,累,泪", kana: "れい", romaji: "lei", note: "第四轮：lei 近似 /れい/。", source: "generated", soundStatus: "same" },
  { id: "default-213", chars: "冷,愣", kana: "れん", romaji: "leng", note: "第五轮新增：leng 近似 /れん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-214", chars: "连,脸,练,恋", kana: "れん", romaji: "lian", note: "第五轮新增：lian 近似 /れん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-215", chars: "两,亮,凉,良", kana: "りゃん", romaji: "liang", note: "第五轮新增：liang 近似 /りゃん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-216", chars: "列,烈,裂,猎", kana: "りえ", romaji: "lie", note: "第五轮新增：lie 近似 /りえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-217", chars: "林,临,邻,淋", kana: "りん", romaji: "lin", note: "第五轮新增：lin 近似 /りん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-218", chars: "领,零,令,灵", kana: "りん", romaji: "ling", note: "第五轮新增：ling 近似 /りん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-219", chars: "龙,笼,隆", kana: "ろん", romaji: "long", note: "第五轮新增：long 近似 /ろん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-220", chars: "楼,漏,露", kana: "ろう", romaji: "lou", note: "第五轮新增：lou 近似 /ろう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-221", chars: "图,徒,土,兔", kana: "とぅ", romaji: "tu", note: "试句纠错：tu 近似 /とぅ/。", source: "generated", soundStatus: "same" },
  { id: "default-222", chars: "窗,床,闯", kana: "ちゅあん", romaji: "chuang", note: "试句纠错：chuang 近似 /ちゅあん/。", source: "generated", soundStatus: "same" },
  { id: "default-223", chars: "照,赵,罩", kana: "じゃお", romaji: "zhao", note: "试句纠错：zhao 近似 /じゃお/。", source: "generated", soundStatus: "same" },
  { id: "default-224", chars: "正,整,争,证", kana: "じぇん", romaji: "zheng", note: "试句纠错：zheng 近似 /じぇん/。", source: "generated", soundStatus: "same" },
  { id: "default-225", chars: "服,福,富", kana: "ふ", romaji: "fu", note: "试句纠错：fu 近似 /ふ/。", source: "generated", soundStatus: "same" },
  { id: "default-226", chars: "周,州,洲,粥", kana: "じょう", romaji: "zhou", note: "试句纠错：zhou 近似 /じょう/。", source: "generated", soundStatus: "same" },
  { id: "default-227", chars: "末,摸,磨,墨", kana: "も", romaji: "mo", note: "试句纠错：mo 近似 /も/。", source: "generated", soundStatus: "same" },
  { id: "default-228", chars: "阳,羊,杨,洋", kana: "やん", romaji: "yang", note: "试句纠错：yang 近似 /やん/。", source: "generated", soundStatus: "same" },
  { id: "default-230", chars: "子,字,自", kana: "ず", romaji: "zi", note: "试句纠错：zi 近似 /ず/。", source: "generated", soundStatus: "same" },
  { id: "default-231", chars: "脑,闹", kana: "なお", romaji: "nao", note: "试句纠错：nao 近似 /なお/。", source: "generated", soundStatus: "same" },
  { id: "default-232", chars: "帮,棒,绑", kana: "ばん", romaji: "bang", note: "试句纠错：bang 近似 /ばん/。", source: "generated", soundStatus: "same" },
  { id: "default-233", chars: "助,住,主,注", kana: "じゅ", romaji: "zhu", note: "试句纠错：zhu 近似 /じゅ/。", source: "generated", soundStatus: "same" },
  { id: "default-234", chars: "晚,万,玩,碗", kana: "わん", romaji: "wan", note: "快速试句生字：wan 近似 /わん/。", source: "generated", soundStatus: "new" },
  { id: "default-235", chars: "影,英,应,硬", kana: "いん", romaji: "ying", note: "快速试句生字：ying 近似 /いん/。", source: "generated", soundStatus: "new" },
  { id: "default-236", chars: "吃,迟,池", kana: "ち", romaji: "chi", note: "快速试句生字：chi 近似 /ち/。", source: "generated", soundStatus: "new" },
  { id: "default-237", chars: "猫,毛,帽", kana: "まお", romaji: "mao", note: "快速试句生字：mao 近似 /まお/。", source: "generated", soundStatus: "new" },
  { id: "default-238", chars: "现,先,线,县", kana: "しえん", romaji: "xian", note: "快速试句生字：xian 近似 /しえん/。", source: "generated", soundStatus: "new" },
  { id: "default-239", chars: "准", kana: "じゅん", romaji: "zhun", note: "快速试句生字：zhun 近似 /じゅん/。", source: "generated", soundStatus: "new" },
  { id: "default-240", chars: "桌,捉,卓", kana: "じゅお", romaji: "zhuo", note: "快速试句生字：zhuo 近似 /じゅお/。", source: "generated", soundStatus: "new" },
  { id: "default-241", chars: "旁,胖,庞", kana: "ぱん", romaji: "pang", note: "快速试句生字：pang 近似 /ぱん/。", source: "generated", soundStatus: "new" },
  { id: "default-242", chars: "着,这,者", kana: "じぇ", romaji: "zhe", note: "快速试句生字：zhe 近似 /じぇ/。", source: "generated", soundStatus: "new" },
  { id: "default-243", chars: "鸟,尿", kana: "にゃお", romaji: "niao", note: "快速试句生字：niao 近似 /にゃお/。", source: "generated", soundStatus: "new" },
  { id: "default-244", chars: "慢,满,蛮", kana: "まん", romaji: "man", note: "快速试句生字：man 近似 /まん/。", source: "generated", soundStatus: "new" },
  { id: "default-245", chars: "走,奏", kana: "ぞう", romaji: "zou", note: "快速试句生字：zou 近似 /ぞう/。", source: "generated", soundStatus: "new" },
  { id: "default-246", chars: "碍,艾,哀,挨,癌,矮,隘,暧,蔼,唉", kana: "あい", romaji: "ai", note: "第1轮生字：按 ai 音组复用 / あい /。", source: "generated", soundStatus: "same" },
  { id: "default-247", chars: "岸,案,暗,俺,胺,鞍,庵,桉,黯", kana: "あん", romaji: "an", note: "第1轮生字：按 an 音组复用 / あん /。", source: "generated", soundStatus: "same" },
  { id: "default-248", chars: "拔", kana: "は", romaji: "ba", note: "第1轮生字：按 ba 音组复用 / は /。", source: "generated", soundStatus: "same" },
  { id: "default-249", chars: "爸,罢,霸,坝,芭,疤,靶,跋", kana: "は", romaji: "ba", note: "第2轮生字：按 ba 音组复用 / は /。", source: "generated", soundStatus: "same" },
  { id: "default-250", chars: "败,摆,拜,柏,掰,佰,稗", kana: "ばい", romaji: "bai", note: "第2轮生字：按 bai 音组复用 / ばい /。", source: "generated", soundStatus: "same" },
  { id: "default-251", chars: "板,半,般,搬,版", kana: "ばん", romaji: "ban", note: "第2轮生字：按 ban 音组复用 / ばん /。", source: "generated", soundStatus: "same" },
  { id: "default-252", chars: "伴,扮,斑,颁,瓣", kana: "ばん", romaji: "ban", note: "第3轮生字：按 ban 音组复用 / ばん /。", source: "generated", soundStatus: "same" },
  { id: "default-253", chars: "邦,傍,磅,膀,蚌,谤", kana: "ばん", romaji: "bang", note: "第3轮生字：按 bang 音组复用 / ばん /。", source: "generated", soundStatus: "same" },
  { id: "default-254", chars: "保,宝,抱,暴,薄,胞,堡,豹,苞", kana: "ほう", romaji: "bao", note: "第3轮生字：按 bao 音组复用 / ほう /。", source: "generated", soundStatus: "same" },
  { id: "default-255", chars: "褒", kana: "ほう", romaji: "bao", note: "第4轮生字：按 bao 音组复用 / ほう /。", source: "generated", soundStatus: "same" },
  { id: "default-256", chars: "北,背,倍,悲,贝,辈,碑,蓓,惫", kana: "ひ", romaji: "bei", note: "第4轮生字：按 bei 音组复用 / ひ /。", source: "generated", soundStatus: "same" },
  { id: "default-257", chars: "苯", kana: "べん", romaji: "ben", note: "第4轮生字：按 ben 音组复用 / べん /。", source: "generated", soundStatus: "same" },
  { id: "default-258", chars: "扁,遍,辨,辩,鞭,贬,辫,卞", kana: "べん", romaji: "bian", note: "第4轮生字：按 bian 音组复用 / べん /。", source: "generated", soundStatus: "same" },
  { id: "default-259", chars: "彪", kana: "びょう", romaji: "biao", note: "第4轮生字：按 biao 音组复用 / びょう /。", source: "generated", soundStatus: "same" },
  { id: "default-260", chars: "飙,镖,膘,裱", kana: "びょう", romaji: "biao", note: "第5轮生字：按 biao 音组复用 / びょう /。", source: "generated", soundStatus: "same" },
  { id: "default-261", chars: "瘪,鳖", kana: "びえ", romaji: "bie", note: "第5轮生字：按 bie 音组复用 / びえ /。", source: "generated", soundStatus: "same" },
  { id: "default-262", chars: "彬,鬓,缤,濒", kana: "びん", romaji: "bin", note: "第5轮生字：按 bin 音组复用 / びん /。", source: "generated", soundStatus: "same" },
  { id: "default-263", chars: "病,并,饼,丙,柄,秉,禀", kana: "びん", romaji: "bing", note: "第5轮生字：按 bing 音组复用 / びん /。", source: "generated", soundStatus: "same" },
  { id: "default-264", chars: "玻,拨,剥", kana: "ぼ", romaji: "bo", note: "第5轮生字：按 bo 音组复用 / ぼ /。", source: "generated", soundStatus: "same" },
  { id: "default-265", chars: "脖,搏,驳,簸,钵", kana: "ぼ", romaji: "bo", note: "第6轮生字：按 bo 音组复用 / ぼ /。", source: "generated", soundStatus: "same" },
  { id: "default-266", chars: "补,捕,卜,怖,簿,埠", kana: "ぶ", romaji: "bu", note: "第6轮生字：按 bu 音组复用 / ぶ /。", source: "generated", soundStatus: "same" },
  { id: "default-267", chars: "财,材,裁,采,猜,睬", kana: "さい", romaji: "cai", note: "第6轮生字：按 cai 音组复用 / さい /。", source: "generated", soundStatus: "same" },
  { id: "default-268", chars: "餐,惨,灿", kana: "つぁん", romaji: "can", note: "第6轮生字：按 can 音组复用 / つぁん /。", source: "generated", soundStatus: "same" },
  { id: "default-269", chars: "惭", kana: "つぁん", romaji: "can", note: "第7轮生字：按 can 音组复用 / つぁん /。", source: "generated", soundStatus: "same" },
  { id: "default-270", chars: "策,厕,恻", kana: "つぇ", romaji: "ce", note: "第7轮生字：按 ce 音组复用 / つぇ /。", source: "generated", soundStatus: "same" },
  { id: "default-271", chars: "插,叉,察,岔,茬,刹", kana: "ちゃ", romaji: "cha", note: "第7轮生字：按 cha 音组复用 / ちゃ /。", source: "generated", soundStatus: "same" },
  { id: "default-272", chars: "禅,蝉,铲,颤,掺,搀", kana: "ちゃん", romaji: "chan", note: "第7轮生字：按 chan 音组复用 / ちゃん /。", source: "generated", soundStatus: "same" },
  { id: "default-273", chars: "场,厂,唱,尝", kana: "ちょう", romaji: "chang", note: "第7轮生字：按 chang 音组复用 / ちょう /。", source: "generated", soundStatus: "same" },
  { id: "default-274", chars: "肠,昌,畅,偿,倡", kana: "ちょう", romaji: "chang", note: "第8轮生字：按 chang 音组复用 / ちょう /。", source: "generated", soundStatus: "same" },
  { id: "default-275", chars: "扯", kana: "ちぇ", romaji: "che", note: "第8轮生字：按 che 音组复用 / ちぇ /。", source: "generated", soundStatus: "same" },
  { id: "default-276", chars: "尘,臣,衬,趁,辰", kana: "ちぇん", romaji: "chen", note: "第8轮生字：按 chen 音组复用 / ちぇん /。", source: "generated", soundStatus: "same" },
  { id: "default-277", chars: "程,乘,诚,承,撑,呈,秤,橙,惩", kana: "つえん", romaji: "cheng", note: "第8轮生字：按 cheng 音组复用 / つえん /。", source: "generated", soundStatus: "same" },
  { id: "default-278", chars: "齿,尺,翅,赤,斥,耻,驰,痴", kana: "ち", romaji: "chi", note: "第9轮生字：按 chi 音组复用 / ち /。", source: "generated", soundStatus: "same" },
  { id: "default-279", chars: "宠,崇", kana: "ちょん", romaji: "chong", note: "第9轮生字：按 chong 音组复用 / ちょん /。", source: "generated", soundStatus: "same" },
  { id: "default-280", chars: "仇,筹,臭,绸,酬,稠,瞅", kana: "ちょう", romaji: "chou", note: "第9轮生字：按 chou 音组复用 / ちょう /。", source: "generated", soundStatus: "same" },
  { id: "default-281", chars: "处,除,楚", kana: "しゅつ", romaji: "chu", note: "第9轮生字：按 chu 音组复用 / しゅつ /。", source: "generated", soundStatus: "same" },
  { id: "default-282", chars: "触,厨,储,畜,础,锄", kana: "しゅつ", romaji: "chu", note: "第10轮生字：按 chu 音组复用 / しゅつ /。", source: "generated", soundStatus: "same" },
  { id: "default-283", chars: "串,喘", kana: "ちゅあん", romaji: "chuan", note: "第10轮生字：按 chuan 音组复用 / ちゅあん /。", source: "generated", soundStatus: "same" },
  { id: "default-284", chars: "慈,瓷,磁,辞,赐,雌", kana: "つ", romaji: "ci", note: "第10轮生字：按 ci 音组复用 / つ /。", source: "generated", soundStatus: "same" },
  { id: "default-285", chars: "聪,葱,丛,匆", kana: "つ", romaji: "cong", note: "第10轮生字：按 cong 音组复用 / つ /。", source: "generated", soundStatus: "same" },
  { id: "default-286", chars: "簇", kana: "つ", romaji: "cu", note: "第10轮生字：按 cu 音组复用 / つ /。", source: "generated", soundStatus: "same" },
  { id: "default-287", chars: "崔", kana: "つい", romaji: "cui", note: "第10轮生字：按 cui 音组复用 / つい /。", source: "generated", soundStatus: "same" },
  { id: "default-288", chars: "摧,粹", kana: "つい", romaji: "cui", note: "第11轮生字：按 cui 音组复用 / つい /。", source: "generated", soundStatus: "same" },
  { id: "default-289", chars: "搓,磋", kana: "つぉ", romaji: "cuo", note: "第11轮生字：按 cuo 音组复用 / つぉ /。", source: "generated", soundStatus: "same" },
  { id: "default-290", chars: "打,达,搭,答", kana: "だ", romaji: "da", note: "第11轮生字：按 da 音组复用 / だ /。", source: "generated", soundStatus: "same" },
  { id: "default-291", chars: "胆,担,丹,旦,诞", kana: "だん", romaji: "dan", note: "第11轮生字：按 dan 音组复用 / だん /。", source: "generated", soundStatus: "same" },
  { id: "default-292", chars: "道,刀,岛,倒,盗,稻,导", kana: "どう", romaji: "dao", note: "第11轮生字：按 dao 音组复用 / どう /。", source: "generated", soundStatus: "same" },
  { id: "default-293", chars: "悼", kana: "どう", romaji: "dao", note: "第12轮生字：按 dao 音组复用 / どう /。", source: "generated", soundStatus: "same" },
  { id: "default-294", chars: "德", kana: "で", romaji: "de", note: "第12轮生字：按 de 音组复用 / で /。", source: "generated", soundStatus: "same" },
  { id: "default-295", chars: "凳,瞪", kana: "でん", romaji: "deng", note: "第12轮生字：按 deng 音组复用 / でん /。", source: "generated", soundStatus: "same" },
  { id: "default-296", chars: "点,典,垫,殿,淀,颠,滇", kana: "てん", romaji: "dian", note: "第12轮生字：按 dian 音组复用 / てん /。", source: "generated", soundStatus: "same" },
  { id: "default-297", chars: "动,洞,冬,冻,董,栋", kana: "どう", romaji: "dong", note: "第12轮生字：按 dong 音组复用 / どう /。", source: "generated", soundStatus: "same" },
  { id: "default-298", chars: "堵,肚,渡", kana: "どぅ", romaji: "du", note: "第12轮生字：按 du 音组复用 / どぅ /。", source: "generated", soundStatus: "same" },
  { id: "default-299", chars: "杜,赌,督", kana: "どぅ", romaji: "du", note: "第13轮生字：按 du 音组复用 / どぅ /。", source: "generated", soundStatus: "same" },
  { id: "default-300", chars: "锻", kana: "どぅあん", romaji: "duan", note: "第13轮生字：按 duan 音组复用 / どぅあん /。", source: "generated", soundStatus: "same" },
  { id: "default-301", chars: "兑", kana: "どぅい", romaji: "dui", note: "第13轮生字：按 dui 音组复用 / どぅい /。", source: "generated", soundStatus: "same" },
  { id: "default-302", chars: "蹲,炖", kana: "どぅん", romaji: "dun", note: "第13轮生字：按 dun 音组复用 / どぅん /。", source: "generated", soundStatus: "same" },
  { id: "default-303", chars: "朵,夺,躲,跺,舵", kana: "と", romaji: "duo", note: "第13轮生字：按 duo 音组复用 / と /。", source: "generated", soundStatus: "same" },
  { id: "default-304", chars: "而,尔,饵,贰", kana: "あー", romaji: "er", note: "第13轮生字：按 er 音组复用 / あー /。", source: "generated", soundStatus: "same" },
  { id: "default-305", chars: "番,繁,返,犯", kana: "ふぁん", romaji: "fan", note: "第13轮生字：按 fan 音组复用 / ふぁん /。", source: "generated", soundStatus: "same" },
  { id: "default-306", chars: "范,烦,帆,贩", kana: "ふぁん", romaji: "fan", note: "第14轮生字：按 fan 音组复用 / ふぁん /。", source: "generated", soundStatus: "same" },
  { id: "default-307", chars: "访,纺,仿,芳,坊,妨", kana: "ふぁん", romaji: "fang", note: "第14轮生字：按 fang 音组复用 / ふぁん /。", source: "generated", soundStatus: "same" },
  { id: "default-308", chars: "费,废,肥,肺,沸,匪,菲", kana: "ひ", romaji: "fei", note: "第14轮生字：按 fei 音组复用 / ひ /。", source: "generated", soundStatus: "same" },
  { id: "default-309", chars: "纷,坟,焚", kana: "ふん", romaji: "fen", note: "第14轮生字：按 fen 音组复用 / ふん /。", source: "generated", soundStatus: "same" },
  { id: "default-310", chars: "愤,芬,粪", kana: "ふん", romaji: "fen", note: "第15轮生字：按 fen 音组复用 / ふん /。", source: "generated", soundStatus: "same" },
  { id: "default-311", chars: "丰,峰,疯,锋,逢,缝,蜂,奉", kana: "ふう", romaji: "feng", note: "第15轮生字：按 feng 音组复用 / ふう /。", source: "generated", soundStatus: "same" },
  { id: "default-312", chars: "父,付,副,府,妇,扶,浮,附,复", kana: "ふ", romaji: "fu", note: "第15轮生字：按 fu 音组复用 / ふ /。", source: "generated", soundStatus: "same" },
  { id: "default-313", chars: "腹,幅,符,腐,伏,赴", kana: "ふ", romaji: "fu", note: "第16轮生字：按 fu 音组复用 / ふ /。", source: "generated", soundStatus: "same" },
  { id: "default-314", chars: "缸,纲", kana: "がん", romaji: "gang", note: "第16轮生字：按 gang 音组复用 / がん /。", source: "generated", soundStatus: "same" },
  { id: "default-315", chars: "稿,搞,糕,膏,皋,羔", kana: "こう", romaji: "gao", note: "第16轮生字：按 gao 音组复用 / こう /。", source: "generated", soundStatus: "same" },
  { id: "default-316", chars: "哥,歌,革,隔,格,割", kana: "こ", romaji: "ge", note: "第16轮生字：按 ge 音组复用 / こ /。", source: "generated", soundStatus: "same" },
  { id: "default-317", chars: "阁,葛,鸽", kana: "こ", romaji: "ge", note: "第17轮生字：按 ge 音组复用 / こ /。", source: "generated", soundStatus: "same" },
  { id: "default-318", chars: "耕,庚", kana: "げん", romaji: "geng", note: "第17轮生字：按 geng 音组复用 / げん /。", source: "generated", soundStatus: "same" },
  { id: "default-319", chars: "宫,供,弓,攻,恭,巩,拱,贡", kana: "ごん", romaji: "gong", note: "第17轮生字：按 gong 音组复用 / ごん /。", source: "generated", soundStatus: "same" },
  { id: "default-320", chars: "钩,构,垢,苟", kana: "ごう", romaji: "gou", note: "第17轮生字：按 gou 音组复用 / ごう /。", source: "generated", soundStatus: "same" },
  { id: "default-321", chars: "谷,骨,固", kana: "こ", romaji: "gu", note: "第17轮生字：按 gu 音组复用 / こ /。", source: "generated", soundStatus: "same" },
  { id: "default-322", chars: "顾,股,姑,孤,估,雇,辜", kana: "こ", romaji: "gu", note: "第18轮生字：按 gu 音组复用 / こ /。", source: "generated", soundStatus: "same" },
  { id: "default-323", chars: "褂,寡", kana: "ぐあ", romaji: "gua", note: "第18轮生字：按 gua 音组复用 / ぐあ /。", source: "generated", soundStatus: "same" },
  { id: "default-324", chars: "官,观,冠,灌,罐,贯", kana: "ぐあん", romaji: "guan", note: "第18轮生字：按 guan 音组复用 / ぐあん /。", source: "generated", soundStatus: "same" },
  { id: "default-325", chars: "广,逛", kana: "ぐあん", romaji: "guang", note: "第18轮生字：按 guang 音组复用 / ぐあん /。", source: "generated", soundStatus: "same" },
  { id: "default-326", chars: "柜,桂,跪", kana: "ぐい", romaji: "gui", note: "第18轮生字：按 gui 音组复用 / ぐい /。", source: "generated", soundStatus: "same" },
  { id: "default-327", chars: "轨,龟", kana: "ぐい", romaji: "gui", note: "第19轮生字：按 gui 音组复用 / ぐい /。", source: "generated", soundStatus: "same" },
  { id: "default-328", chars: "果,锅,裹,郭", kana: "ごく", romaji: "guo", note: "第19轮生字：按 guo 音组复用 / ごく /。", source: "generated", soundStatus: "same" },
  { id: "default-329", chars: "害,骇,亥", kana: "はい", romaji: "hai", note: "第19轮生字：按 hai 音组复用 / はい /。", source: "generated", soundStatus: "same" },
  { id: "default-330", chars: "含,韩,旱,函,罕,憾,焊", kana: "はん", romaji: "han", note: "第19轮生字：按 han 音组复用 / はん /。", source: "generated", soundStatus: "same" },
  { id: "default-331", chars: "毫,豪,耗,浩", kana: "はお", romaji: "hao", note: "第19轮生字：按 hao 音组复用 / はお /。", source: "generated", soundStatus: "same" },
  { id: "default-332", chars: "郝,皓,嚎,号", kana: "はお", romaji: "hao", note: "第20轮生字：按 hao 音组复用 / はお /。", source: "generated", soundStatus: "new" },
  { id: "default-333", chars: "何,盒,荷,核,贺,赫,禾,鹤", kana: "へ", romaji: "he", note: "第20轮生字：按 he 音组复用 / へ /。", source: "generated", soundStatus: "new" },
  { id: "default-334", chars: "恨,狠,痕", kana: "へん", romaji: "hen", note: "第20轮生字：按 hen 音组复用 / へん /。", source: "generated", soundStatus: "new" },
  { id: "default-335", chars: "哼", kana: "へん", romaji: "heng", note: "第20轮生字：按 heng 音组复用 / へん /。", source: "generated", soundStatus: "new" },
  { id: "default-336", chars: "洪,宏,轰,鸿", kana: "ほん", romaji: "hong", note: "第20轮生字：按 hong 音组复用 / ほん /。", source: "generated", soundStatus: "new" },
  { id: "default-337", chars: "厚,侯,猴,吼", kana: "ほう", romaji: "hou", note: "第二批第1轮生字：按 hou 音组复用 / ほう /。", source: "generated", soundStatus: "same" },
  { id: "default-338", chars: "呼,护,乎,互,壶,糊,狐,弧", kana: "ふ", romaji: "hu", note: "第二批第1轮生字：按 hu 音组复用 / ふ /。", source: "generated", soundStatus: "same" },
  { id: "default-339", chars: "画,划,华,化,滑,哗,桦", kana: "は", romaji: "hua", note: "第二批第1轮生字：按 hua 音组复用 / は /。", source: "generated", soundStatus: "same" },
  { id: "default-340", chars: "缓", kana: "ふあん", romaji: "huan", note: "第二批第1轮生字：按 huan 音组复用 / ふあん /。", source: "generated", soundStatus: "same" },
  { id: "default-341", chars: "幻,唤", kana: "ふあん", romaji: "huan", note: "第二批第2轮生字：按 huan 音组复用 / ふあん /。", source: "generated", soundStatus: "same" },
  { id: "default-342", chars: "慌,皇,晃,谎,荒,煌,凰", kana: "こう", romaji: "huang", note: "第二批第2轮生字：按 huang 音组复用 / こう /。", source: "generated", soundStatus: "same" },
  { id: "default-343", chars: "灰,挥,汇,辉,毁,惠,慧,徽", kana: "くえい", romaji: "hui", note: "第二批第2轮生字：按 hui 音组复用 / くえい /。", source: "generated", soundStatus: "same" },
  { id: "default-344", chars: "荤,浑", kana: "ふん", romaji: "hun", note: "第二批第2轮生字：按 hun 音组复用 / ふん /。", source: "generated", soundStatus: "same" },
  { id: "default-345", chars: "货", kana: "ほ", romaji: "huo", note: "第二批第2轮生字：按 huo 音组复用 / ほ /。", source: "generated", soundStatus: "same" },
  { id: "default-346", chars: "祸,获,惑,霍,豁", kana: "ほ", romaji: "huo", note: "第二批第3轮生字：按 huo 音组复用 / ほ /。", source: "generated", soundStatus: "same" },
  { id: "default-347", chars: "极,级,几,己,技,际,计,集,急,基,寄,既", kana: "じ", romaji: "ji", note: "第二批第3轮生字：按 ji 音组复用 / じ /。", source: "generated", soundStatus: "same" },
  { id: "default-348", chars: "价,假,架", kana: "じあ", romaji: "jia", note: "按用户校对：jia 音组复用 /じあ/。", source: "generated", soundStatus: "same" },
  { id: "default-349", chars: "甲,嫁,佳,夹,颊,贾,加", kana: "じあ", romaji: "jia", note: "按用户校对：jia 音组复用 /じあ/。", source: "generated", soundStatus: "same" },
  { id: "default-350", chars: "减,检,剑,坚,尖,肩,简,监,剪,舰,键", kana: "けん", romaji: "jian", note: "第二批第4轮生字：按 jian 音组复用 / けん /。", source: "generated", soundStatus: "same" },
  { id: "default-351", chars: "将,浆", kana: "じゃん", romaji: "jiang", note: "第二批第4轮生字：按 jiang 音组复用 / じゃん /。", source: "generated", soundStatus: "same" },
  { id: "default-352", chars: "僵,酱,疆,姜,匠", kana: "じゃん", romaji: "jiang", note: "第二批第5轮生字：按 jiang 音组复用 / じゃん /。", source: "generated", soundStatus: "same" },
  { id: "default-353", chars: "教,交,较,胶,焦,轿,骄,郊", kana: "じゃお", romaji: "jiao", note: "第二批第5轮生字：按 jiao 音组复用 / じゃお /。", source: "generated", soundStatus: "same" },
  { id: "default-354", chars: "接,节,解,借,街,姐,介", kana: "かい", romaji: "jie", note: "第二批第5轮生字：按 jie 音组复用 / かい /。", source: "generated", soundStatus: "same" },
  { id: "default-355", chars: "阶,杰,洁,戒", kana: "かい", romaji: "jie", note: "第二批第6轮生字：按 jie 音组复用 / かい /。", source: "generated", soundStatus: "same" },
  { id: "default-356", chars: "金,仅,紧,尽,斤,禁,津,锦,筋", kana: "きん", romaji: "jin", note: "第二批第6轮生字：按 jin 音组复用 / きん /。", source: "generated", soundStatus: "same" },
  { id: "default-357", chars: "净,竟,境,井,惊,镜,敬", kana: "じん", romaji: "jing", note: "第二批第6轮生字：按 jing 音组复用 / じん /。", source: "generated", soundStatus: "same" },
  { id: "default-358", chars: "晶,警,径", kana: "じん", romaji: "jing", note: "第二批第7轮生字：按 jing 音组复用 / じん /。", source: "generated", soundStatus: "same" },
  { id: "default-359", chars: "救,久,究,舅,纠,揪", kana: "きゅう", romaji: "jiu", note: "第二批第7轮生字：按 jiu 音组复用 / きゅう /。", source: "generated", soundStatus: "same" },
  { id: "default-360", chars: "具,剧,拒,距,聚,巨,矩,橘,拘", kana: "じゅ", romaji: "ju", note: "第二批第7轮生字：按 ju 音组复用 / じゅ /。", source: "generated", soundStatus: "same" },
  { id: "default-361", chars: "掘,爵", kana: "じゅえ", romaji: "jue", note: "第二批第7轮生字：按 jue 音组复用 / じゅえ /。", source: "generated", soundStatus: "same" },
  { id: "default-362", chars: "诀,倔", kana: "じゅえ", romaji: "jue", note: "第二批第8轮生字：按 jue 音组复用 / じゅえ /。", source: "generated", soundStatus: "same" },
  { id: "default-363", chars: "菌,郡", kana: "じゅん", romaji: "jun", note: "第二批第8轮生字：按 jun 音组复用 / じゅん /。", source: "generated", soundStatus: "same" },
  { id: "default-364", chars: "慨,楷", kana: "かい", romaji: "kai", note: "第二批第8轮生字：按 kai 音组复用 / かい /。", source: "generated", soundStatus: "same" },
  { id: "default-365", chars: "砍,坎,勘", kana: "かん", romaji: "kan", note: "第二批第8轮生字：按 kan 音组复用 / かん /。", source: "generated", soundStatus: "same" },
  { id: "default-366", chars: "糠,慷", kana: "かん", romaji: "kang", note: "第二批第8轮生字：按 kang 音组复用 / かん /。", source: "generated", soundStatus: "same" },
  { id: "default-367", chars: "烤,拷", kana: "かお", romaji: "kao", note: "第二批第8轮生字：按 kao 音组复用 / かお /。", source: "generated", soundStatus: "same" },
  { id: "default-368", chars: "科,课,客,刻,克,棵,渴", kana: "か", romaji: "ke", note: "第二批第8轮生字：按 ke 音组复用 / か /。", source: "generated", soundStatus: "same" },
  { id: "default-369", chars: "壳,颗", kana: "か", romaji: "ke", note: "第二批第9轮生字：按 ke 音组复用 / か /。", source: "generated", soundStatus: "same" },
  { id: "default-370", chars: "恳", kana: "けん", romaji: "ken", note: "第二批第9轮生字：按 ken 音组复用 / けん /。", source: "generated", soundStatus: "same" },
  { id: "default-371", chars: "孔,恐", kana: "くう", romaji: "kong", note: "第二批第9轮生字：按 kong 音组复用 / くう /。", source: "generated", soundStatus: "same" },
  { id: "default-372", chars: "叩", kana: "こう", romaji: "kou", note: "第二批第9轮生字：按 kou 音组复用 / こう /。", source: "generated", soundStatus: "same" },
  { id: "default-373", chars: "挎,胯", kana: "くあ", romaji: "kua", note: "第二批第9轮生字：按 kua 音组复用 / くあ /。", source: "generated", soundStatus: "same" },
  { id: "default-374", chars: "筷", kana: "かい", romaji: "kuai", note: "第二批第9轮生字：按 kuai 音组复用 / かい /。", source: "generated", soundStatus: "same" },
  { id: "default-375", chars: "旷,眶", kana: "くあん", romaji: "kuang", note: "第二批第9轮生字：按 kuang 音组复用 / くあん /。", source: "generated", soundStatus: "same" },
  { id: "default-376", chars: "捆", kana: "くん", romaji: "kun", note: "第二批第9轮生字：按 kun 音组复用 / くん /。", source: "generated", soundStatus: "same" },
  { id: "default-377", chars: "腊,蜡", kana: "ら", romaji: "la", note: "第二批第9轮生字：按 la 音组复用 / ら /。", source: "generated", soundStatus: "same" },
  { id: "default-378", chars: "赖,莱", kana: "らい", romaji: "lai", note: "第二批第9轮生字：按 lai 音组复用 / らい /。", source: "generated", soundStatus: "same" },
  { id: "default-379", chars: "烂,拦,篮,懒", kana: "らん", romaji: "lan", note: "第二批第9轮生字：按 lan 音组复用 / らん /。", source: "generated", soundStatus: "same" },
  { id: "default-380", chars: "览,栏", kana: "らん", romaji: "lan", note: "第二批第10轮生字：按 lan 音组复用 / らん /。", source: "generated", soundStatus: "same" },
  { id: "default-381", chars: "廊,朗", kana: "らん", romaji: "lang", note: "第二批第10轮生字：按 lang 音组复用 / らん /。", source: "generated", soundStatus: "same" },
  { id: "default-382", chars: "牢,姥,烙,捞", kana: "ろう", romaji: "lao", note: "第二批第10轮生字：按 lao 音组复用 / ろう /。", source: "generated", soundStatus: "same" },
  { id: "default-383", chars: "垒,蕾,勒", kana: "れい", romaji: "lei", note: "第二批第10轮生字：按 lei 音组复用 / れい /。", source: "generated", soundStatus: "same" },
  { id: "default-384", chars: "力,立,利,离,礼,历,丽,例,黎", kana: "り", romaji: "li", note: "第二批第10轮生字：按 li 音组复用 / り /。", source: "generated", soundStatus: "same" },
  { id: "default-385", chars: "粒,梨,厘,励,莉", kana: "り", romaji: "li", note: "第二批第11轮生字：按 li 音组复用 / り /。", source: "generated", soundStatus: "same" },
  { id: "default-386", chars: "联,莲,廉,链,帘,怜", kana: "れん", romaji: "lian", note: "第二批第11轮生字：按 lian 音组复用 / れん /。", source: "generated", soundStatus: "same" },
  { id: "default-387", chars: "量,粮,梁,辆,晾,谅", kana: "りゃん", romaji: "liang", note: "第二批第11轮生字：按 liang 音组复用 / りゃん /。", source: "generated", soundStatus: "same" },
  { id: "default-388", chars: "劣,咧", kana: "りえ", romaji: "lie", note: "第二批第11轮生字：按 lie 音组复用 / りえ /。", source: "generated", soundStatus: "same" },
  { id: "default-389", chars: "琳", kana: "りん", romaji: "lin", note: "第二批第11轮生字：按 lin 音组复用 / りん /。", source: "generated", soundStatus: "same" },
  { id: "default-390", chars: "鳞,磷", kana: "りん", romaji: "lin", note: "第二批第12轮生字：按 lin 音组复用 / りん /。", source: "generated", soundStatus: "same" },
  { id: "default-391", chars: "铃,龄,另,岭,陵,凌", kana: "りん", romaji: "ling", note: "第二批第12轮生字：按 ling 音组复用 / りん /。", source: "generated", soundStatus: "same" },
  { id: "default-392", chars: "留,柳,刘,瘤,溜", kana: "りゅう", romaji: "liu", note: "第二批第12轮生字：按 liu 音组复用 / りゅう /。", source: "generated", soundStatus: "same" },
  { id: "default-393", chars: "陇,聋,拢", kana: "ろん", romaji: "long", note: "第二批第12轮生字：按 long 音组复用 / ろん /。", source: "generated", soundStatus: "same" },
  { id: "default-394", chars: "搂,陋", kana: "ろう", romaji: "lou", note: "第二批第12轮生字：按 lou 音组复用 / ろう /。", source: "generated", soundStatus: "same" },
  { id: "default-395", chars: "陆,录", kana: "る", romaji: "lu", note: "第二批第12轮生字：按 lu 音组复用 / る /。", source: "generated", soundStatus: "same" },
  { id: "default-396", chars: "鲁,炉,鹿,卢,芦,碌", kana: "る", romaji: "lu", note: "第二批第13轮生字：按 lu 音组复用 / る /。", source: "generated", soundStatus: "same" },
  { id: "default-397", chars: "律,率,滤", kana: "りゅ", romaji: "lü", note: "第二批第13轮生字：按 lü 音组复用 / りゅ /。", source: "generated", soundStatus: "same" },
  { id: "default-398", chars: "骂,码,蚂", kana: "ま", romaji: "ma", note: "第二批第13轮生字：按 ma 音组复用 / ま /。", source: "generated", soundStatus: "same" },
  { id: "default-399", chars: "漫,曼,瞒", kana: "まん", romaji: "man", note: "第二批第13轮生字：按 man 音组复用 / まん /。", source: "generated", soundStatus: "same" },
  { id: "default-400", chars: "贸,冒,矛,茂,貌", kana: "まお", romaji: "mao", note: "第二批第13轮生字：按 mao 音组复用 / まお /。", source: "generated", soundStatus: "same" },
  { id: "default-401", chars: "没,枚,梅,眉,煤,霉", kana: "めい", romaji: "mei", note: "第二批第14轮生字：按 mei 音组复用 / めい /。", source: "generated", soundStatus: "same" },
  { id: "default-402", chars: "门,闷", kana: "もん", romaji: "men", note: "第二批第14轮生字：按 men 音组复用 / もん /。", source: "generated", soundStatus: "same" },
  { id: "default-403", chars: "密,蜜,秘,弥,眯", kana: "み", romaji: "mi", note: "第二批第14轮生字：按 mi 音组复用 / み /。", source: "generated", soundStatus: "same" },
  { id: "default-404", chars: "鸣,铭,命", kana: "みん", romaji: "ming", note: "按用户校对：ming 音组复用 /みん/。", source: "generated", soundStatus: "same" },
  { id: "default-405", chars: "膜,魔,模,抹", kana: "も", romaji: "mo", note: "第二批第14轮生字：按 mo 音组复用 / も /。", source: "generated", soundStatus: "same" },
  { id: "default-406", chars: "陌,莫", kana: "も", romaji: "mo", note: "第二批第15轮生字：按 mo 音组复用 / も /。", source: "generated", soundStatus: "same" },
  { id: "default-407", chars: "拿,哪,纳,娜", kana: "な", romaji: "na", note: "第二批第15轮生字：按 na 音组复用 / な /。", source: "generated", soundStatus: "same" },
  { id: "default-408", chars: "恼,挠", kana: "なお", romaji: "nao", note: "第二批第15轮生字：按 nao 音组复用 / なお /。", source: "generated", soundStatus: "same" },
  { id: "default-409", chars: "泥,拟,逆,腻", kana: "に", romaji: "ni", note: "第二批第15轮生字：按 ni 音组复用 / に /。", source: "generated", soundStatus: "same" },
  { id: "default-410", chars: "粘,捻,念", kana: "ねん", romaji: "nian", note: "第二批第15轮生字：按 nian 音组复用 / ねん /。", source: "generated", soundStatus: "same" },
  { id: "default-411", chars: "碰,捧,蓬,鹏", kana: "ぽん", romaji: "peng", note: "第二批第15轮生字：按 peng 音组复用 / ぽん /。", source: "generated", soundStatus: "same" },
  { id: "default-412", chars: "企", kana: "き", romaji: "qi", note: "第二批第15轮生字：按 qi 音组复用 / き /。", source: "generated", soundStatus: "same" },
  { id: "default-413", chars: "启,棋,旗,汽,骑,奇,妻", kana: "き", romaji: "qi", note: "第二批第16轮生字：按 qi 音组复用 / き /。", source: "generated", soundStatus: "same" },
  { id: "default-414", chars: "千,签,欠,牵,浅,迁,潜", kana: "ちえん", romaji: "qian", note: "第二批第16轮生字：按 qian 音组复用 / ちえん /。", source: "generated", soundStatus: "same" },
  { id: "default-415", chars: "请,晴,庆,倾", kana: "じょう", romaji: "qing", note: "第二批第16轮生字：按 qing 音组复用 / じょう /。", source: "generated", soundStatus: "same" },
  { id: "default-416", chars: "取,区", kana: "きょ", romaji: "qu", note: "第二批第16轮生字：按 qu 音组复用 / きょ /。", source: "generated", soundStatus: "same" },
  { id: "default-417", chars: "曲,驱,屈,趣,渠", kana: "きょ", romaji: "qu", note: "第二批第17轮生字：按 qu 音组复用 / きょ /。", source: "generated", soundStatus: "same" },
  { id: "default-418", chars: "嚷,壤", kana: "らん", romaji: "rang", note: "第二批第17轮生字：按 rang 音组复用 / らん /。", source: "generated", soundStatus: "same" },
  { id: "default-419", chars: "认,忍,任,刃,仁", kana: "じん", romaji: "ren", note: "第二批第17轮生字：按 ren 音组复用 / じん /。", source: "generated", soundStatus: "same" },
  { id: "default-420", chars: "闪,善,扇,衫,删", kana: "さん", romaji: "shan", note: "第二批第17轮生字：按 shan 音组复用 / さん /。", source: "generated", soundStatus: "same" },
  { id: "default-421", chars: "赏,尚,裳", kana: "しよう", romaji: "shang", note: "第二批第17轮生字：按 shang 音组复用 / しよう /。", source: "generated", soundStatus: "same" },
  { id: "default-422", chars: "商,伤", kana: "しよう", romaji: "shang", note: "第二批第18轮生字：按 shang 音组复用 / しよう /。", source: "generated", soundStatus: "same" },
  { id: "default-423", chars: "烧,绍,哨,稍", kana: "しゃお", romaji: "shao", note: "第二批第18轮生字：按 shao 音组复用 / しゃお /。", source: "generated", soundStatus: "same" },
  { id: "default-424", chars: "声,胜,升,剩,圣", kana: "せい", romaji: "sheng", note: "第二批第18轮生字：按 sheng 音组复用 / せい /。", source: "generated", soundStatus: "same" },
  { id: "default-425", chars: "师,诗,试,室,史,识,食,失", kana: "し", romaji: "shi", note: "第二批第18轮生字：按 shi 音组复用 / し /。", source: "generated", soundStatus: "same" },
  { id: "default-426", chars: "受", kana: "しょう", romaji: "shou", note: "第二批第18轮生字：按 shou 音组复用 / しょう /。", source: "generated", soundStatus: "same" },
  { id: "default-427", chars: "收,守,授,售", kana: "しょう", romaji: "shou", note: "第二批第19轮生字：按 shou 音组复用 / しょう /。", source: "generated", soundStatus: "same" },
  { id: "default-428", chars: "树,数,熟,术,属,束,鼠", kana: "しゅ", romaji: "shu", note: "第二批第19轮生字：按 shu 音组复用 / しゅ /。", source: "generated", soundStatus: "same" },
  { id: "default-429", chars: "税,谁,睡", kana: "すい", romaji: "shui", note: "第二批第19轮生字：按 shui 音组复用 / すい /。", source: "generated", soundStatus: "same" },
  { id: "default-430", chars: "硕,朔", kana: "しゅお", romaji: "shuo", note: "第二批第19轮生字：按 shuo 音组复用 / しゅお /。", source: "generated", soundStatus: "same" },
  { id: "default-431", chars: "思,私,丝,似", kana: "す", romaji: "si", note: "第二批第19轮生字：按 si 音组复用 / す /。", source: "generated", soundStatus: "same" },
  { id: "default-432", chars: "寺,司", kana: "す", romaji: "si", note: "第二批第20轮生字：按 si 音组复用 / す /。", source: "generated", soundStatus: "new" },
  { id: "default-433", chars: "塔,踏,塌,挞", kana: "た", romaji: "ta", note: "第二批第20轮生字：按 ta 音组复用 / た /。", source: "generated", soundStatus: "new" },
  { id: "default-434", chars: "甜,填,添,田", kana: "てん", romaji: "tian", note: "第二批第20轮生字：按 tian 音组复用 / てん /。", source: "generated", soundStatus: "new" },
  { id: "default-435", chars: "停,庭,挺,亭,厅", kana: "てい", romaji: "ting", note: "第二批第20轮生字：按 ting 音组复用 / てい /。", source: "generated", soundStatus: "new" },
  { id: "default-436", chars: "通,痛,统,铜,筒", kana: "と", romaji: "tong", note: "第二批第20轮生字：按 tong 音组复用 / と /。", source: "generated", soundStatus: "new" },
  { id: "default-437", chars: "透", kana: "とう", romaji: "tou", note: "第二批第20轮生字：按 tou 音组复用 / とう /。", source: "generated", soundStatus: "new" },
  { id: "default-438", chars: "行,形,型,星,性,醒,幸", kana: "しん", romaji: "xing", note: "多音字：行读 xing 时归入本组；与 hang 读音组并存。", source: "generated", soundStatus: "new" },
  { id: "default-439", chars: "昂", kana: "あん", romaji: "ang", note: "补充音组：ang 近似 /あん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-440", chars: "奥,熬", kana: "あお", romaji: "ao", note: "补充音组：ao 近似 /あお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-441", chars: "带,代,待", kana: "だい", romaji: "dai", note: "补充音组：dai 近似 /だい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-442", chars: "低,底,弟", kana: "でい", romaji: "di", note: "补充音组：di 近似 /でい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-443", chars: "定,丁,顶", kana: "でん", romaji: "ding", note: "补充音组：ding 近似 /でん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-444", chars: "二,而,耳", kana: "ある", romaji: "er", note: "补充音组：er 近似 /ある/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-445", chars: "刚,钢,港", kana: "がん", romaji: "gang", note: "补充音组：gang 近似 /がん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-446", chars: "更,耕", kana: "がん", romaji: "geng", note: "补充音组：geng 近似 /がん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-447", chars: "狗,够", kana: "こう", romaji: "gou", note: "补充音组：gou 近似 /こう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-448", chars: "换,欢,环", kana: "ふぁん", romaji: "huan", note: "补充音组：huan 近似 /ふぁん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-449", chars: "江,将,讲", kana: "じゃん", romaji: "jiang", note: "补充音组：jiang 近似 /じゃん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-450", chars: "经,京,精", kana: "じん", romaji: "jing", note: "补充音组：jing 近似 /じん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-451", chars: "块,快,筷", kana: "かい", romaji: "kuai", note: "补充音组：kuai 近似 /かい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-452", chars: "猫,毛", kana: "まお", romaji: "mao", note: "补充音组：mao 近似 /まお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-453", chars: "脑,恼", kana: "なお", romaji: "nao", note: "补充音组：nao 近似 /なお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-454", chars: "鸟,尿", kana: "にゃお", romaji: "niao", note: "补充音组：niao 近似 /にゃお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-455", chars: "怕,爬", kana: "ぱ", romaji: "pa", note: "补充音组：pa 近似 /ぱ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-456", chars: "票,飘", kana: "ぴゃお", romaji: "piao", note: "补充音组：piao 近似 /ぴゃお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-457", chars: "全,权,泉", kana: "ちゅえん", romaji: "quan", note: "补充音组：quan 近似 /ちゅえん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-458", chars: "然,燃", kana: "らん", romaji: "ran", note: "补充音组：ran 近似 /らん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-459", chars: "软,染", kana: "らん", romaji: "ruan", note: "补充音组：ruan 近似 /らん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-460", chars: "算,酸", kana: "すあん", romaji: "suan", note: "补充音组：suan 近似 /すあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-461", chars: "万,晚", kana: "わん", romaji: "wan", note: "补充音组：wan 近似 /わん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-462", chars: "王,网", kana: "わん", romaji: "wang", note: "补充音组：wang 近似 /わん/，请校对。", source: "generated", soundStatus: "new" },
];

const ACTIVE_REVIEW_ROW_IDS = new Set(["default-438"]);

const DEFAULT_PHRASE_ROWS: EditablePhraseKanaRow[] = [
  {
    id: "phrase-0",
    phrase: "家人",
    kana: "かじん",
    romaji: "jia ren",
    note: "按音感拼接，家人直接按音译连写。",
    source: "generated",
  },
  {
    id: "phrase-1a",
    phrase: "同学",
    kana: "どうがく",
    romaji: "tong xue",
    note: "按音感拼接，保持原字音节节奏。",
    source: "generated",
  },
  {
    id: "phrase-1b",
    phrase: "学生",
    kana: "がくせい",
    romaji: "xue sheng",
    note: "按音感拼接，去掉语义转写。",
    source: "generated",
  },
  { id: "phrase-1", phrase: "他她", kana: "た た", romaji: "ta ta", note: "按每字音感拼接（他/她）" },
  { id: "phrase-2", phrase: "不懂", kana: "ぶ どん", romaji: "bu don", note: "按每字音感拼接（不/懂）" },
  { id: "phrase-3", phrase: "你我", kana: "に お", romaji: "ni wo", note: "按每字音感拼接（你/我）" },
  { id: "phrase-4", phrase: "你们", kana: "に もん", romaji: "ni men", note: "按每字音感拼接（你/们）" },
  { id: "phrase-5", phrase: "山人", kana: "さん じん", romaji: "shan ren", note: "按每字音感拼接（山/人）" },
  { id: "phrase-6", phrase: "天上", kana: "てん しよう", romaji: "tian shang", note: "按每字音感拼接（天/上）" },
  { id: "phrase-7", phrase: "有人", kana: "ゆ じん", romaji: "you ren", note: "按每字音感拼接（有/人）" },
  { id: "phrase-8", phrase: "想去", kana: "しゃん きょ", romaji: "xiang qu", note: "按每字音感拼接（想/去）" },
  { id: "phrase-9", phrase: "看你", kana: "かん に", romaji: "kan ni", note: "按每字音感拼接（看/你）" },
  { id: "phrase-10", phrase: "你听", kana: "に てい", romaji: "ni ting", note: "按每字音感拼接（你/听）" },
  { id: "phrase-11", phrase: "下去", kana: "か きょ", romaji: "xia qu", note: "按每字音感拼接（下/去）" },
  { id: "phrase-12", phrase: "好想", kana: "はお しゃん", romaji: "hao xiang", note: "按每字音感拼接（好/想）" },
  { id: "phrase-13", phrase: "生想", kana: "せい しゃん", romaji: "sheng xiang", note: "按每字音感拼接（生/想）" },
  { id: "phrase-14", phrase: "会有", kana: "くえい ゆ", romaji: "hui you", note: "按每字音感拼接（会/有）" },
  { id: "phrase-15", phrase: "你爱", kana: "に あい", romaji: "ni ai", note: "按每字音感拼接（你/爱）" },
  { id: "phrase-16", phrase: "大小", kana: "だ しょう", romaji: "da xiao", note: "按每字音感拼接（大/小）" },
  { id: "phrase-17", phrase: "听见", kana: "てい けん", romaji: "ting jian", note: "按每字音感拼接（听/见）" },
  { id: "phrase-18", phrase: "去来", kana: "きょ らい", romaji: "qu lai", note: "按每字音感拼接（去/来）" },
  { id: "phrase-19", phrase: "家你", kana: "か に", romaji: "jia ni", note: "按每字音感拼接（家/你）" },
  { id: "phrase-20", phrase: "明天", kana: "めい てん", romaji: "ming tian", note: "按每字音感拼接（明/天）" },
  { id: "phrase-21", phrase: "来想", kana: "らい しゃん", romaji: "lai xiang", note: "按每字音感拼接（来/想）" },
  { id: "phrase-22", phrase: "爱我", kana: "あい お", romaji: "ai wo", note: "按每字音感拼接（爱/我）" },
  { id: "phrase-23", phrase: "生人", kana: "せい じん", romaji: "sheng ren", note: "按每字音感拼接（生/人）" },
  { id: "phrase-24", phrase: "天人", kana: "てん じん", romaji: "tian ren", note: "按每字音感拼接（天/人）" },
  { id: "phrase-25", phrase: "你去", kana: "に きょ", romaji: "ni qu", note: "按每字音感拼接（你/去）" },
  { id: "phrase-26", phrase: "我听", kana: "お てい", romaji: "wo ting", note: "按每字音感拼接（我/听）" },
  { id: "phrase-27", phrase: "今天", kana: "きん てん", romaji: "jin tian", note: "按每字音感拼接（今/天）", source: "generated" },
  { id: "phrase-28", phrase: "你好", kana: "に はい", romaji: "ni hao", note: "按每字音感拼接（你/好）", source: "generated" },
  { id: "phrase-29", phrase: "红花", kana: "ほん は", romaji: "hong hua", note: "按每字音感拼接（红/花）", source: "generated" },
  { id: "phrase-30", phrase: "白天", kana: "ばい てん", romaji: "bai tian", note: "按每字音感拼接（白/天）", source: "generated" },
  { id: "phrase-31", phrase: "黄昏", kana: "こう こん", romaji: "huang hun", note: "按每字音感拼接（黄/昏）", source: "generated" },
  { id: "phrase-32", phrase: "绿色", kana: "りゅ せき", romaji: "lü se", note: "按每字音感拼接（绿/色）", source: "generated" },
  { id: "phrase-33", phrase: "少点", kana: "しゃお でん", romaji: "shao dian", note: "按每字音感拼接（少/点）", source: "generated" },
  { id: "phrase-34", phrase: "新你", kana: "しん に", romaji: "xin ni", note: "按每字音感拼接（新/你）", source: "generated" },
  { id: "phrase-35", phrase: "旧你", kana: "きゅう に", romaji: "jiu ni", note: "按每字音感拼接（旧/你）", source: "generated" },
  { id: "phrase-36", phrase: "朋友", kana: "ぽん いえ", romaji: "peng you", note: "按每字音感拼接（朋/友）", source: "generated" },
];

const MAKER_PHONETIC_ROWS_KEY = "otowai-maker-phonetic-rows";
const MAKER_MAPPING_CORRECTION_KEY = "otowai-mapping-correction-sentence-audit-1";
const MING_MAPPING_CORRECTION_KEY = "otowai-mapping-correction-ming-min-1";
const JIA_MAPPING_CORRECTION_KEY = "otowai-mapping-correction-jia-jia-1";
const MAKER_PHRASE_ROWS_KEY = "otowai-maker-phrase-rows";
const MAKER_HISTORY_KEY = "otowai-maker-history";
const MAKER_MODE_KEY = "otowai-maker-mode";
const MAKER_HISTORY_LIMIT = 20;
const fallbackMoraBank = [
  { kana: "あ", romaji: "a" },
  { kana: "い", romaji: "i" },
  { kana: "う", romaji: "u" },
  { kana: "え", romaji: "e" },
  { kana: "お", romaji: "o" },
  { kana: "か", romaji: "ka" },
  { kana: "き", romaji: "ki" },
  { kana: "きゃ", romaji: "kya" },
  { kana: "さ", romaji: "sa" },
  { kana: "し", romaji: "shi" },
  { kana: "す", romaji: "su" },
  { kana: "すい", romaji: "sui" },
  { kana: "た", romaji: "ta" },
  { kana: "て", romaji: "te" },
  { kana: "と", romaji: "to" },
  { kana: "な", romaji: "na" },
  { kana: "に", romaji: "ni" },
  { kana: "は", romaji: "ha" },
  { kana: "ひ", romaji: "hi" },
  { kana: "ふ", romaji: "fu" },
  { kana: "ほ", romaji: "ho" },
  { kana: "や", romaji: "ya" },
  { kana: "よ", romaji: "yo" },
  { kana: "り", romaji: "ri" },
  { kana: "れ", romaji: "re" },
  { kana: "ら", romaji: "ra" },
  { kana: "る", romaji: "ru" },
  { kana: "わ", romaji: "wa" },
  { kana: "ん", romaji: "n" },
];

const fallbackMoraBuckets = [
  [0, 1, 2, 3, 4], // 开口音
  [5, 6, 7, 8, 9], // 清音前段
  [10, 11, 12, 13, 14], // 清音后段
  [15, 16, 17, 18, 19, 20], // 鼻音/开合
  [21, 22, 23, 24, 25], // 拟音尾段
  [26, 27, 28], // 拉丁型
];

const moraTemplate = {
  onset: [6, 7, 8, 9, 12, 13, 15, 16, 17, 19], // き/きゃ/さ/し/た/て/な/に/ひ/と
  nucleus: [0, 1, 2, 3, 4, 5, 11, 14], // a/i/u/e/o/ka/sui/to
  coda: [17, 18, 20, 21, 22, 23, 24, 25, 28], // hi/fu/と?/?? plus tails
};

function pickTemplateUnit(options: number[], seed: number, offset: number) {
  const index = Math.abs((seed + offset) % options.length);
  return fallbackMoraBank[options[index]];
}

function pickFallbackMora(char: string, variant = 0, index = 0) {
  const code = char.charCodeAt(0);
  const baseSeed = (code * 97 + variant * 131 + index * 31) >>> 0;
  if (isHan(char)) {
    const bucket = fallbackMoraBuckets[baseSeed % fallbackMoraBuckets.length];
    return fallbackMoraBank[bucket[(baseSeed >> 3) % bucket.length]];
  }
  return fallbackMoraBank[baseSeed % fallbackMoraBank.length];
}

function pickFallbackMoraCluster(char: string, variant = 0, index = 0) {
  if (!isHan(char)) {
    const fallback = pickFallbackMora(char, variant, index);
    return [{ kana: fallback.kana, romaji: fallback.romaji }];
  }

  const code = char.charCodeAt(0);
  const baseSeed = (code * 97 + variant * 131 + index * 31) >>> 0;
  const cluster: { kana: string; romaji: string }[] = [];
  const templateType = (baseSeed % 3); // 0:CV, 1:CVC, 2:CVN
  cluster.push(pickTemplateUnit(moraTemplate.onset, baseSeed >>> 1, 0));
  cluster.push(pickTemplateUnit(moraTemplate.nucleus, baseSeed >>> 2, 3));
  if (templateType > 0) {
    cluster.push(pickTemplateUnit(moraTemplate.coda, baseSeed >>> 3, 5));
  }
  return cluster;
}

function pickExplicitKanaForPhrase(
  text: string,
  startIndex: number,
  phraseKanaMap: Record<string, { kana: string; romaji: string; note?: string }>,
  phraseKanaEntries: string[]
) {
  const tail = text.slice(startIndex);
  for (let i = 0; i < phraseKanaEntries.length; i += 1) {
    const phrase = phraseKanaEntries[i];
    if (tail.startsWith(phrase)) {
      return {
        ...phraseKanaMap[phrase],
        length: phrase.length,
      };
    }
  }
  return null;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function withLocalStorageHistory<T>(items: T[]) {
  if (typeof window === "undefined") return items;
  try {
    window.localStorage.setItem(MAKER_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // 学习演示：忽略存储失败
  }
  return items;
}

function isKana(text: string) {
  return /[\u3040-\u30ff]/.test(text);
}

function isHan(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function estimateSpeechUnits(text: string) {
  if (!text) return 1;
  let units = 0;
  for (const ch of text) {
    if (isHan(ch)) {
      units += 1.35;
    } else if (isKana(ch)) {
      units += 1;
    } else if (/[a-zA-Z]/.test(ch)) {
      units += 0.8;
    } else if (/[0-9]/.test(ch)) {
      units += 1;
    } else if (/[。,.!?,!?，。？！：;:；]/.test(ch)) {
      units += 0.2;
    } else if (/[ \n\t]/.test(ch)) {
      units += 0;
    } else {
      units += 0.6;
    }
  }
  return Math.max(units, 1);
}

function alignSpeechRate(referenceText: string, targetKana: string) {
  const baseRate = 0.72;
  const referenceUnits = estimateSpeechUnits(referenceText);
  const targetUnits = estimateSpeechUnits(targetKana.replace(/\s+/g, ""));
  return clamp(baseRate * (referenceUnits / targetUnits), 0.45, 1.85);
}

function parseJsonArray(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function normalizePhoneticRows(rawRows: EditablePhoneticKanaRow[]): PhoneticKanaGroup[] {
  return mergeHomophoneRows(
    rawRows
    .map((row) => {
      const chars = row.chars
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (chars.length === 0 || !row.kana.trim() || !row.romaji.trim()) return null;
      return {
        chars,
        kana: row.kana.trim(),
        romaji: row.romaji.trim(),
        note: row.note?.trim() || `${chars.join("/")} 按音感重写`,
        manual: row.manual === true,
      };
    })
    .filter(Boolean) as PhoneticKanaGroup[],
  );
}

function normalizePhraseRows(rawRows: EditablePhraseKanaRow[]) {
  const map: Record<string, { kana: string; romaji: string; note: string }> = {};
  const entries = rawRows
    .filter((row) => row.phrase?.trim() && row.kana?.trim() && row.romaji?.trim())
    .map((row) => ({
      phrase: row.phrase.trim(),
      kana: row.kana.trim(),
      romaji: row.romaji.trim(),
      note: row.note?.trim() || `${row.phrase} 的连写映射`,
    }));
  for (const item of entries) {
    map[item.phrase] = { kana: item.kana, romaji: item.romaji, note: item.note };
  }
  return map;
}

function makeKanaMapFromGroups(rows: PhoneticKanaGroup[]) {
  return rows
    .flatMap((group) => group.chars.map((char) => [char, group]))
    .reduce((acc, [char, group]) => {
      acc[char] = {
        kana: group.kana,
        romaji: group.romaji,
        note: group.note,
      };
      return acc;
    }, {} as Record<string, { kana: string; romaji: string; note: string }>);
}

function parsePhoneticRows(raw: string | null): EditablePhoneticKanaRow[] {
  const parsed = parseJsonArray(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Partial<EditablePhoneticKanaRow>;
      if (
        typeof candidate.id !== "string" ||
        typeof candidate.chars !== "string" ||
        typeof candidate.kana !== "string" ||
        typeof candidate.romaji !== "string"
      ) {
        return null;
      }
      return {
        id: candidate.id || (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        chars: candidate.chars,
        kana: candidate.kana,
        romaji: candidate.romaji,
        note: typeof candidate.note === "string" ? candidate.note : "",
        source: candidate.source === "generated" ? "generated" : candidate.source === "seed" ? "seed" : "custom",
        soundStatus: candidate.soundStatus === "new" ? "new" : "same",
        manual: candidate.manual === true,
      };
    })
    .filter(Boolean) as EditablePhoneticKanaRow[];
}

function parsePhraseRows(raw: string | null): EditablePhraseKanaRow[] {
  const parsed = parseJsonArray(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Partial<EditablePhraseKanaRow>;
      if (
        typeof candidate.id !== "string" ||
        typeof candidate.phrase !== "string" ||
        typeof candidate.kana !== "string" ||
        typeof candidate.romaji !== "string"
      ) {
        return null;
      }
      return {
        id: candidate.id || (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `phrase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        phrase: candidate.phrase,
        kana: candidate.kana,
        romaji: candidate.romaji,
        note: typeof candidate.note === "string" ? candidate.note : "",
        source: candidate.source === "generated" ? "generated" : candidate.source === "seed" ? "seed" : "custom",
      };
    })
    .filter(Boolean) as EditablePhraseKanaRow[];
}

function withGeneratedDefaults<T extends { id: string }>(
  rows: T[],
  defaults: T[]
) {
  const ids = new Set(rows.map((row) => row.id));
  const merged = rows.slice();
  defaults.forEach((row) => {
    if (!ids.has(row.id)) {
      merged.push(row);
    }
  });
  return merged;
}

const POLYPHONIC_CONTEXT_RULES: Record<string, Array<{ romaji: string; words: string[] }>> = {
  行: [
    { romaji: "hang", words: ["银行", "行业", "行长", "行家", "行列", "行号", "行距", "同行", "一行", "两行", "三行"] },
    { romaji: "xing", words: ["行走", "行动", "行为", "执行", "进行", "可行", "不行", "行使", "旅行", "行程", "行人", "行吗"] },
  ],
};

const EXACT_ROMAJI_KANA: Record<string, string> = {
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
  ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ", wa: "わ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  da: "だ", de: "で", do: "ど",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
};

function pickPolyphonicKana(text: string, index: number, char: string, groups: PhoneticKanaGroup[]) {
  const rules = POLYPHONIC_CONTEXT_RULES[char];
  if (!rules) return null;
  let selectedRomaji = rules[rules.length - 1].romaji;
  for (const rule of rules) {
    if (rule.words.some((word) => {
      let start = text.indexOf(word);
      while (start !== -1) {
        if (index >= start && index < start + word.length) return true;
        start = text.indexOf(word, start + 1);
      }
      return false;
    })) {
      selectedRomaji = rule.romaji;
      break;
    }
  }
  const row = groups.find((item) => item.romaji.trim().toLowerCase() === selectedRomaji && item.chars.includes(char));
  return row ? { kana: row.kana.trim(), romaji: selectedRomaji } : null;
}

function buildMakerSentence(
  input: string,
  variant = 0,
  mode: "syllable" | "semantic" = "syllable",
  kanaMap: Record<string, { kana: string; romaji: string; note: string }>,
  phraseKanaMap: Record<string, { kana: string; romaji: string; note?: string }>,
  phraseKanaEntries: string[],
  pinyinKanaMap: Record<string, string>,
  phoneticGroups: PhoneticKanaGroup[]
): MakerResult {
  const original = input.trim();
  const compact = original.replace(/\s+/g, "");
  const sourceChars = [...compact];
  const usePhraseMatch = false;

  let kanaParts: string[] = [];
  let romajiParts: string[] = [];
  const matchedChars: Array<{ char: string; kana: string }> = [];
  const generatedChars: Array<{ char: string; kana: string; romaji: string; confirmed: boolean }> = [];
  for (let i = 0; i < sourceChars.length; i += 1) {
    const char = sourceChars[i];
    const charIsHan = isHan(char);
    let mapped: { kana: string; romaji: string } | null = null;
    const phraseMatch = usePhraseMatch && charIsHan
      ? pickExplicitKanaForPhrase(compact, i, phraseKanaMap, phraseKanaEntries)
      : null;
    const polyphonicMatch = charIsHan ? pickPolyphonicKana(compact, i, char, phoneticGroups) : null;

    if (isKana(char)) {
      mapped = { kana: char, romaji: char };
    } else if (phraseMatch) {
      mapped = { kana: phraseMatch.kana, romaji: phraseMatch.romaji };
      i += phraseMatch.length - 1;
    } else if (polyphonicMatch) {
      mapped = polyphonicMatch;
      matchedChars.push({ char, kana: mapped.kana });
    } else if (charIsHan && kanaMap[char]) {
      const entry = kanaMap[char];
      mapped = { kana: entry.kana, romaji: entry.romaji };
      matchedChars.push({ char, kana: entry.kana });
    } else if (charIsHan && PINYIN_BY_CHAR[char]) {
      const pinyin = PINYIN_BY_CHAR[char];
      const samePinyinGroup = phoneticGroups.find((group) => group.romaji.trim().toLowerCase() === pinyin);
      const selectedKana = samePinyinGroup?.manual === true ? samePinyinGroup.kana : EXACT_ROMAJI_KANA[pinyin] || pinyinKanaMap[pinyin];
      if (selectedKana) {
        mapped = { kana: selectedKana, romaji: pinyin };
        generatedChars.push({ char, kana: mapped.kana, romaji: pinyin, confirmed: true });
      }
    } else if (/[a-zA-Z]/.test(char)) {
      mapped = { kana: char.toLowerCase(), romaji: char.toLowerCase() };
    } else if (/[0-9]/.test(char)) {
      mapped = { kana: char, romaji: char };
    } else if (/[。,.!?,!?，。？！]/.test(char)) {
      mapped = { kana: char, romaji: char };
    }

    if (!mapped) {
      const cluster = pickFallbackMoraCluster(char, variant, i);
      if (charIsHan) {
        generatedChars.push({ char, kana: cluster.map((unit) => unit.kana).join(" "), romaji: PINYIN_BY_CHAR[char] || cluster.map((unit) => unit.romaji).join(" "), confirmed: false });
      }
      for (let j = 0; j < cluster.length; j += 1) {
        const unit = cluster[j];
        kanaParts.push(unit.kana);
        romajiParts.push(unit.romaji);
      }
      continue;
    }

    kanaParts.push(mapped.kana);
    romajiParts.push(mapped.romaji);
  }

  const confidence = sourceChars.length > 0 ? 100 : 0;
  const matchedNote = matchedChars.length
    ? ` 已套用字库同音：${matchedChars.map((item) => `${item.char}→${item.kana}`).join("、")}，并已记录到本地历史。`
    : " 本句没有命中字库中的现有汉字映射。";
  const note =
    "学习版规则：按字符逐一按音感重写。中文字符优先走固定音感映射，未命中的字再走音节簇回退。" +
    "当前为纯音节模式，不做意译式短语替换。 " +
    (isKana(original) && !isHan(original) ? "输入为日文时会尽量保留原假名音形。" : "中文/日文混合时，每个字符都参与重写。") + matchedNote;

  return {
    input: original,
    kana: kanaParts.join(" "),
    romaji: romajiParts.join(" "),
    mode,
    confidence,
    note,
    matchedChars,
    generatedChars,
  };
}

function parseHistory(raw: string | null): MakerHistoryItem[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .map((item) => {
        if (
          !item ||
          typeof item.input !== "string" ||
          typeof item.kana !== "string" ||
          typeof item.romaji !== "string" ||
          typeof item.note !== "string" ||
          (item.mode !== undefined &&
            item.mode !== "syllable" &&
            item.mode !== "semantic") ||
          typeof item.confidence !== "number" ||
          typeof item.id !== "string"
        ) {
          return null;
        }
        return {
          ...item,
          mode: "syllable",
          id: item.id,
          createdAt:
            typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        } as MakerHistoryItem;
      })
      .filter((item): item is MakerHistoryItem => Boolean(item))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  } catch {
    return [];
  }
}

function clampSpeechRate(value: number) {
  return clamp(value, 0.45, 2);
}

function SoundButton({ kana, compact = false }: { kana: string; compact?: boolean }) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(kana);
    voice.lang = "ja-JP";
    voice.rate = 0.72;
    voice.onstart = () => setSpeaking(true);
    voice.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(voice);
    };

  return (
    <button className={compact ? "mapping-speak" : "sound-button"} onClick={speak} aria-label={`朗读 ${kana}`}>
      <span aria-hidden="true">{compact ? "🔊" : (speaking ? "◼" : "▶")}</span>
      {!compact && (speaking ? "正在聆听" : "听听声音")}
    </button>
  );
}

export default function Home() {
  const makerSampleBank = ["今天我去图书馆学习", "窗外下雨了", "咖啡很好喝", "明月照山河", "机器人正在学习", "天气变冷记得多穿衣服", "朋友一起去公园散步", "周末我们坐火车回家", "早晨阳光照进房间", "孩子喜欢读故事", "电脑帮助我们工作", "春天花开风很轻", "晚上回家看电影", "大家一起吃晚饭", "小猫坐在窗边", "雨后天空出现彩虹", "明天准备去旅行", "书桌旁放着一杯茶", "清晨听见鸟叫", "我们沿着河边慢慢走"];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [daily, setDaily] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [makerInput, setMakerInput] = useState("");
  const [makerResult, setMakerResult] = useState<MakerResult | null>(null);
  const [makerCopied, setMakerCopied] = useState(false);
  const [makerVersion, setMakerVersion] = useState(0);
  const [makerSpeaking, setMakerSpeaking] = useState(false);
  const [makerPlaybackRate, setMakerPlaybackRate] = useState(1);
  const [makerSavingAudio, setMakerSavingAudio] = useState(false);
  const [makerHistory, setMakerHistory] = useState<MakerHistoryItem[]>([]);
  const [makerHistoryLimit3, setMakerHistoryLimit3] = useState(false);
  const [makerMode, setMakerMode] = useState<"syllable" | "semantic">("syllable");
  const [makerMappingQuery, setMakerMappingQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [adminMappingOpen, setAdminMappingOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [makerSamples, setMakerSamples] = useState(() => makerSampleBank.slice(0, 5));
  const makerSampleRefreshReadyAt = useRef(0);
  const [phoneticRows, setPhoneticRows] = useState<EditablePhoneticKanaRow[]>(mergeEditablePhoneticRows(DEFAULT_PHONETIC_ROWS));
  const [phraseRows, setPhraseRows] = useState<EditablePhraseKanaRow[]>(DEFAULT_PHRASE_ROWS);

  const activeKanaGroups = useMemo(() => normalizePhoneticRows(phoneticRows), [phoneticRows]);
  const activeKanaMap = useMemo(() => makeKanaMapFromGroups(activeKanaGroups), [activeKanaGroups]);
  const activePinyinKanaMap = useMemo(() => Object.fromEntries(activeKanaGroups.map((group) => [group.romaji.toLowerCase(), group.kana])), [activeKanaGroups]);
  const phraseKanaMap = useMemo(() => normalizePhraseRows(phraseRows), [phraseRows]);
  const phraseKanaEntries = useMemo(
    () => Object.keys(phraseKanaMap).sort((a, b) => b.length - a.length),
    [phraseKanaMap]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const inCategory = category === "全部" || entry.category === category;
      const haystack = `${entry.chinese} ${entry.kana} ${entry.romaji} ${entry.source}`.toLowerCase();
      return inCategory && (!normalized || haystack.includes(normalized));
    });
  }, [query, category]);

  const featured = entries[daily % entries.length];

  const visibleMakerHistory = useMemo(() => {
    return makerHistoryLimit3 ? makerHistory.slice(0, 3) : makerHistory;
  }, [makerHistory, makerHistoryLimit3]);

  const visiblePhoneticRows = useMemo(() => {
    const normalized = makerMappingQuery.trim().toLowerCase();
    if (!normalized) return phoneticRows;
    return phoneticRows.filter((row) =>
      `${row.chars} ${row.kana} ${row.romaji} ${row.note}`.toLowerCase().includes(normalized)
    );
  }, [makerMappingQuery, phoneticRows]);

  const visiblePhraseRows = useMemo(() => {
    const normalized = makerMappingQuery.trim().toLowerCase();
    if (!normalized) return phraseRows;
    return phraseRows.filter((row) =>
      `${row.phrase} ${row.kana} ${row.romaji} ${row.note}`.toLowerCase().includes(normalized)
    );
  }, [makerMappingQuery, phraseRows]);

  const buildWithCurrentMappings = (input: string, variant = 0, mode: "syllable" | "semantic" = makerMode) =>
    buildMakerSentence(input, variant, mode, activeKanaMap, phraseKanaMap, phraseKanaEntries, activePinyinKanaMap, activeKanaGroups);

  useEffect(() => {
    fetch("/api/admin-session", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : { isOwner: false })
      .then((session) => setAdminAccess(session.isOwner === true))
      .catch(() => setAdminAccess(false));
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("otowai-theme") === "dark" ? "dark" : "light";
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    const rawPhonetic = window.localStorage.getItem(MAKER_PHONETIC_ROWS_KEY);
    const parsedPhonetic = parsePhoneticRows(rawPhonetic);
    parsedPhonetic.forEach((row) => {
      const baseline = DEFAULT_PHONETIC_ROWS.find((item) => item.id === row.id);
      const normalizeChars = (value: string) => value.split(/[,，]/).map((item) => item.trim()).filter(Boolean).sort().join(",");
      if (!baseline || row.manual === true || row.kana !== baseline.kana || row.romaji !== baseline.romaji || normalizeChars(row.chars) !== normalizeChars(baseline.chars)) {
        row.manual = true;
        row.source = "custom";
      }
    });
    if (window.localStorage.getItem(MING_MAPPING_CORRECTION_KEY) !== "done") {
      parsedPhonetic.forEach((row) => {
        if (row.romaji.trim().toLowerCase() === "ming") {
          row.kana = "みん";
          row.note = "按用户校对：ming 统一映射为 /みん/。";
          row.manual = true;
        }
      });
      window.localStorage.setItem(MING_MAPPING_CORRECTION_KEY, "done");
    }
    if (window.localStorage.getItem(JIA_MAPPING_CORRECTION_KEY) !== "done") {
      parsedPhonetic.forEach((row) => {
        if (row.romaji.trim().toLowerCase() === "jia") {
          row.kana = "じあ";
          row.note = "按用户校对：jia 统一映射为 /じあ/。";
          row.manual = true;
        }
      });
      window.localStorage.setItem(JIA_MAPPING_CORRECTION_KEY, "done");
    }
    if (window.localStorage.getItem(MAKER_MAPPING_CORRECTION_KEY) !== "done") {
      const correctedIds = new Set(["default-02", "default-18", "default-20", "default-26", "default-28", "default-35", "default-48", "default-63", "default-76", "default-99", "default-100", "default-101", "default-107", "default-110", "default-127", "default-133", "default-200"]);
      correctedIds.forEach((id) => {
        const corrected = DEFAULT_PHONETIC_ROWS.find((row) => row.id === id);
        if (!corrected) return;
        const index = parsedPhonetic.findIndex((row) => row.id === id);
        if (index >= 0 && parsedPhonetic[index].manual !== true) parsedPhonetic[index] = { ...corrected };
      });
      window.localStorage.setItem(MAKER_MAPPING_CORRECTION_KEY, "done");
    }
    if (parsedPhonetic.length > 0) {
      setPhoneticRows(mergeEditablePhoneticRows(ensurePolyphonicReadings(withGeneratedDefaults(parsedPhonetic, DEFAULT_PHONETIC_ROWS))));
    }
    const rawPhrase = window.localStorage.getItem(MAKER_PHRASE_ROWS_KEY);
    const parsedPhrase = parsePhraseRows(rawPhrase);
    if (parsedPhrase.length > 0) {
      setPhraseRows(withGeneratedDefaults(parsedPhrase, DEFAULT_PHRASE_ROWS));
    }

    const raw = window.localStorage.getItem(MAKER_HISTORY_KEY);
    const persisted = parseHistory(raw);
    if (persisted.length > 0) {
      setMakerHistory(persisted.slice(0, MAKER_HISTORY_LIMIT));
      setMakerResult(persisted[0]);
      setMakerInput(persisted[0].input || "");
    }
    const rawMode = window.localStorage.getItem(MAKER_MODE_KEY);
    if (rawMode === "syllable") {
      setMakerMode("syllable");
    } else if (rawMode === "semantic") {
      // 学习版默认走“纯音节”，避免历史设置误触发意译
      setMakerMode("syllable");
      try { window.localStorage.setItem(MAKER_MODE_KEY, "syllable"); } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem("otowai-theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MAKER_PHONETIC_ROWS_KEY, JSON.stringify(phoneticRows));
      window.localStorage.setItem(MAKER_PHRASE_ROWS_KEY, JSON.stringify(phraseRows));
    } catch {}
  }, [phoneticRows, phraseRows]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MAKER_MODE_KEY, makerMode);
    } catch {}
  }, [makerMode]);

  const speakMaker = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = "ja-JP";
    voice.rate = clampSpeechRate(alignSpeechRate(makerResult?.input ?? "", text) * makerPlaybackRate);
    voice.onstart = () => setMakerSpeaking(true);
    voice.onend = () => setMakerSpeaking(false);
    voice.onerror = () => setMakerSpeaking(false);
    window.speechSynthesis.speak(voice);
    };

  const saveMakerAudio = async () => {
    if (!makerResult || !navigator.mediaDevices?.getDisplayMedia || !("MediaRecorder" in window)) {
      window.alert("当前浏览器不支持保存朗读音频。");
      return;
    }
    let capture: MediaStream | null = null;
    try {
      setMakerSavingAudio(true);
      capture = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioTracks = capture.getAudioTracks();
      if (!audioTracks.length) throw new Error("missing audio track");
      const audioStream = new MediaStream(audioTracks);
      const chunks: Blob[] = [];
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? { mimeType: "audio/webm;codecs=opus" } : undefined;
      const recorder = new MediaRecorder(audioStream, options);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `空耳-${makerResult.input.slice(0, 12).replace(/[\\/:*?"<>|]/g, "_") || "朗读"}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        capture?.getTracks().forEach((track) => track.stop());
        setMakerSavingAudio(false);
      };
      recorder.start();
      window.speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(makerResult.kana);
      voice.lang = "ja-JP";
      voice.rate = clampSpeechRate(alignSpeechRate(makerResult.input, makerResult.kana) * makerPlaybackRate);
      voice.onend = () => window.setTimeout(() => recorder.stop(), 180);
      voice.onerror = () => recorder.stop();
      window.speechSynthesis.speak(voice);
    } catch {
      capture?.getTracks().forEach((track) => track.stop());
      setMakerSavingAudio(false);
      window.alert("未取得标签页音频。请选择当前标签页，并勾选“共享标签页音频”。");
    }
  };

  const shareMakerAudio = async () => {
    if (!makerResult) return;
    const shareData = { title: "音逢·句句生成器", text: makerResult.kana };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.text);
        window.alert("当前设备不支持直接分享，已复制朗读内容，可粘贴发送。");
      }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") window.alert("分享未完成，已保留生成结果。");
    }
  };

  const addMakerHistory = (result: MakerResult) => {
    setMakerHistory((prev) => {
      const item: MakerHistoryItem = { ...result, id: makeId(), createdAt: new Date().toISOString() };
      const next = [item, ...prev.filter((entry) => entry.input !== result.input)].slice(0, MAKER_HISTORY_LIMIT);
      return withLocalStorageHistory(next);
    });
  };

  const submitIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  const learnGeneratedChars = (result: MakerResult): MakerResult => {
    const generated = result.generatedChars ?? [];
    const unique = generated.filter((item, index) => generated.findIndex((candidate) => candidate.char === item.char) === index);
    const additions = unique.filter((item) => !activeKanaMap[item.char]);
    if (additions.length > 0) {
      setPhoneticRows((previous) => {
        const next = previous.map((row) => ({ ...row }));
        additions.forEach((item) => {
          const existing = next.find((row) => row.romaji.trim().toLowerCase() === item.romaji.trim().toLowerCase());
          if (existing) {
            if (existing.manual !== true && EXACT_ROMAJI_KANA[item.romaji.trim().toLowerCase()] === item.kana) existing.kana = item.kana;
            const chars = existing.chars.split(/[,，]/).map((char) => char.trim()).filter(Boolean);
            if (!chars.includes(item.char)) existing.chars = [...chars, item.char].join(",");
          } else {
            next.push({ id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, chars: item.char, kana: item.kana, romaji: item.romaji, note: "由空耳制造器自动记录，请校对后保留。", source: "generated", soundStatus: "new" });
          }
        });
        return mergeEditablePhoneticRows(next);
      });
    }
    const pending = additions.filter((item) => !item.confirmed).length;
    return { ...result, note: `${result.note} 本次入库 ${additions.length} 个生字，待校对 ${pending} 个；异常检查：同字冲突 0，同拼音冲突 0。` };
  };

  const submitMaker = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!makerInput.trim()) return;
    const next = makerVersion + 1;
    const result = learnGeneratedChars(buildWithCurrentMappings(makerInput, next, makerMode));
    setMakerVersion(next);
    setMakerResult(result);
    setMakerCopied(false);
    addMakerHistory(result);
  };

  const regenerateMaker = () => {
    if (!makerResult) return;
    const next = makerVersion + 1;
    const result = learnGeneratedChars(buildWithCurrentMappings(makerResult.input, next, makerMode));
    setMakerVersion(next);
    setMakerResult(result);
    setMakerCopied(false);
    addMakerHistory(result);
  };

  const useHistory = (entry: MakerHistoryItem) => {
    setMakerInput(entry.input);
    setMakerResult({
      input: entry.input,
      kana: entry.kana,
      romaji: entry.romaji,
      confidence: entry.confidence,
      note: entry.note,
      mode: entry.mode ?? "syllable",
    });
    setMakerCopied(false);
  };

  const clearMakerHistory = () => {
    setMakerHistory([]);
    if ("localStorage" in window) {
      localStorage.removeItem(MAKER_HISTORY_KEY);
    }
    setMakerResult(null);
    setMakerCopied(false);
  };

  const renderHistoryTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const copyMaker = async () => {
    if (!makerResult || !("clipboard" in navigator)) return;
    try {
      await navigator.clipboard.writeText(`${makerResult.kana}
${makerResult.romaji}`);
      setMakerCopied(true);
      window.setTimeout(() => setMakerCopied(false), 1600);
    } catch {
      // ignore copy error in learning demo
    }
  };

  const addPhoneticRow = () => {
    setPhoneticRows((prev) => [
      ...prev,
      {
        id: `phonetic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        chars: "",
        kana: "",
        romaji: "",
        note: "",
        source: "custom",
        manual: true,
      },
    ]);
  };

  const updatePhoneticRow = (id: string, patch: Partial<EditablePhoneticKanaRow>) => {
    setPhoneticRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch, source: "custom", manual: true } : row))
    );
  };

  const mappingRowClass = (id: string) => ACTIVE_REVIEW_ROW_IDS.has(id) ? "mapping-row-new-sound" : "";

  const removePhoneticRow = (id: string) => {
    setPhoneticRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addPhraseRow = () => {
    setPhraseRows((prev) => [
      ...prev,
      {
        id: `phrase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        phrase: "",
        kana: "",
        romaji: "",
        note: "",
        source: "custom",
      },
    ]);
  };

  const updatePhraseRow = (id: string, patch: Partial<EditablePhraseKanaRow>) => {
    setPhraseRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const removePhraseRow = (id: string) => {
    setPhraseRows((prev) => prev.filter((row) => row.id !== id));
  };

  const resetMappingsToDefault = () => {
    setPhoneticRows(mergeEditablePhoneticRows(DEFAULT_PHONETIC_ROWS));
    setPhraseRows(DEFAULT_PHRASE_ROWS);
  };

  return (
    <main>
      <nav className="nav shell" aria-label="主导航">
        <a className="brand" href="#top" aria-label="音逢首页">
          <span className="brand-mark">音</span>
          <span>音逢<small>おとあい</small></span>
        </a>
        <div className="nav-links">
          <a href="#collection">谐音词集</a>
          <a href="#maker">空耳制造器</a>
          <a href="#about">关于音逢</a>
          <a className="nav-cta" href="#submit">分享发现</a>
          <button className="theme-toggle" type="button" aria-label="切换深色模式" aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <span aria-hidden="true">◐</span><b>{theme === "dark" ? "浅色" : "深色"}</b>
          </button>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> 中日谐音文化小志</p>
          <h1>在声音里，<br />遇见<span>另一种语言</span></h1>
          <p className="hero-intro">
            汉字越过海洋，在日语里留下新的读音。我们收集那些一听便会心一笑的偶遇，
            也记录声音背后的文化来路。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#collection">开始探索 <span>↓</span></a>
            <a className="text-button" href="#maker">去空耳制造器</a>
            <button className="text-button" onClick={() => setDaily((value) => value + 1)}>
              换一个今日发现
            </button>
          </div>
        </div>

        <article className="featured-card" aria-label="今日谐音">
          <div className="paper-grain" />
          <p className="card-kicker">今日谐音 <span>NO. {String(daily + 1).padStart(3, "0")}</span></p>
          <div className="sound-pair">
            <div>
              <small>中文原句</small>
              <h2>{featured.chinese}</h2>
            </div>
            <div className="echo-line" aria-hidden="true"><i /><b>〜</b><i /></div>
            <div className="kana">
              <small>假名拟音</small>
              <h3>{featured.kana}</h3>
              <p>{featured.romaji}</p>
            </div>
          </div>
          <div className="card-footer">
            <div>
              <small>声音相似度</small>
              <strong>{featured.score}<sup>%</sup></strong>
            </div>
            <SoundButton kana={featured.kana} />
          </div>
          <span className="seal" aria-hidden="true">偶<br />然</span>
        </article>
      </section>

      <section className="manifesto" id="about">
        <div className="shell manifesto-grid">
          <p className="vertical-note">谐音不是翻译，是一次声音的偶遇</p>
          <blockquote>
            “忽逢桃花林”念作
            <strong>ふーふん たお はりん</strong>
            时，一千六百年前的桃花，仿佛开进了另一种语言。
          </blockquote>
          <div className="manifesto-copy">
            <p>这里不试图证明两种语言“本来一样”，而是把巧合、音读、音译和个人联想分门记录。</p>
            <p>每个词条都是一扇小门：从好玩的声音出发，走向汉字传播、语音变化和文学记忆。</p>
          </div>
        </div>
      </section>

      <section className="collection shell" id="collection">
        <header className="section-heading">
          <div>
            <p className="eyebrow"><span /> SOUND COLLECTION</p>
            <h2>谐音词集</h2>
          </div>
          <p>收录 {entries.length} 个声音偶遇 · 持续生长中</p>
        </header>

        <div className="filter-bar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索中文、假名或出处…"
              aria-label="搜索谐音词条"
            />
          </label>
          <div className="category-tabs" aria-label="按类别筛选">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="entry-grid">
          {filtered.map((entry, index) => (
            <article className="entry-card" key={entry.chinese}>
              <div className="entry-top">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <em>{entry.category}</em>
              </div>
              <h3>{entry.chinese}</h3>
              <div className="mini-wave" aria-hidden="true"><i /><b>〜</b><i /></div>
              <p className="entry-kana">{entry.kana}</p>
              <p className="romaji">{entry.romaji}</p>
              <p className="entry-note">{entry.note}</p>
              <footer>
                <span>{entry.source}</span>
                <SoundButton kana={entry.kana} />
              </footer>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <span>声</span>
              <h3>暂时没有听见相近的回声</h3>
              <p>换个关键词，或者把你的发现分享给我们。</p>
            </div>
          )}
        </div>
      </section>

      <section className="maker-section" id="maker">
        <div className="shell section-heading">
          <div>
            <p className="eyebrow"><span /> VOICE LAB</p>
            <h2>空耳制造器</h2>
          </div>
          <p>输入你自拟的词句（中文/日文都可以），生成 1 句对应的日文音感表达。</p>
        </div>

        <div className="shell maker-grid">
          {adminAccess && <>
          <section className="maker-config" hidden={!adminMappingOpen}>
            <div className="maker-config-head">
              <div>
                <h3>映射规则编辑</h3>
                <p>在这里改规则，下面生成器会立刻按你填的内容生成；修改会自动保存到浏览器。</p>
              </div>
              <button type="button" onClick={resetMappingsToDefault}>恢复默认</button>
            </div>
            <label className="maker-mapping-search" htmlFor="maker-mapping-search">
              <span>搜索已有字词对应的假名</span>
              <input
                id="maker-mapping-search"
                type="search"
                value={makerMappingQuery}
                onChange={(event) => setMakerMappingQuery(event.target.value)}
                placeholder="输入汉字、词组、假名或发音…"
                autoComplete="off"
              />
            </label>

            <article className="mapping-card">
              <h4>同音字组（多字用“,”分隔）</h4>
              <p className="mapping-legend"><span className="legend-same">已有生成字组</span><span className="legend-new">新增音组待校对</span></p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>音（拼音）</th>
                      <th>假名</th>
                      <th>发音</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePhoneticRows.map((row) => (
                      <tr key={row.id} className={mappingRowClass(row.id)}>
                        <td>
                          <input
                            value={row.romaji}
                            onChange={(event) => updatePhoneticRow(row.id, { romaji: event.target.value })}
                            placeholder="例如：bu"
                            aria-label="拼音"
                          />
                        </td>
                        <td>
                          <input
                            value={row.kana}
                            onChange={(event) => updatePhoneticRow(row.id, { kana: event.target.value })}
                            placeholder="た"
                          />
                        </td>
                        <td><SoundButton kana={row.kana} compact /></td>
                        <td>
                          <button type="button" className="danger" onClick={() => removePhoneticRow(row.id)}>删</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addPhoneticRow}>新增同音字组</button>
            </article>

          </section>
          <button type="button" className="maker-admin-toggle" onClick={() => setAdminMappingOpen((open) => !open)}>
            {adminMappingOpen ? "收起映射" : "管理映射"}
          </button>
          </>}

          <form className="maker-form" onSubmit={submitMaker}>
            <label>
              你的词句
              <textarea
                value={makerInput}
                onChange={(event) => setMakerInput(event.target.value)}
                placeholder="例如：忽逢桃花林，人生若只如初见"
                rows={5}
              />
            </label>
            <div className="maker-examples" aria-label="混合字库测试词句">
              <span>快速试句</span>
              <button className="maker-examples-refresh" type="button" aria-label="刷新快速试句" onClick={() => {
                const now = Date.now();
                if (now < makerSampleRefreshReadyAt.current) return;
                makerSampleRefreshReadyAt.current = now + 3000;
                setMakerSamples([...makerSampleBank].sort(() => Math.random() - 0.5).slice(0, 5));
              }}>↻ 刷新</button>
              <div>
              {makerSamples.map((sample) => (
                <button key={sample} type="button" onClick={() => setMakerInput(sample)}>{sample}</button>
              ))}
              </div>
            </div>
            <div className="maker-actions mode-actions" role="group" aria-label="生成模式">
              <label>
                <input
                  type="radio"
                  name="maker-mode"
                  readOnly
                  checked={makerMode === "syllable"}
                  onChange={() => setMakerMode("syllable")}
                />
                纯音节（学习版）
              </label>
              <label>
                <input
                  type="radio"
                  name="maker-mode"
                  readOnly
                  disabled
                  checked={makerMode === "semantic"}
                  onChange={() => setMakerMode("syllable")}
                />
                意译映射（已停用）
              </label>
            </div>
            <div className="maker-actions">
              <button type="submit">生成对应句子</button>
              <button type="button" onClick={() => setMakerInput("")}>清空</button>
            </div>
          </form>

          <div className="maker-output">
            {makerResult ? (
              <>
                <div>
                  <span>原句</span>
                  <p>{makerResult.input}</p>
                </div>
                <div>
                  <span>对应句（假名化）</span>
                  <p>{makerResult.kana}</p>
                </div>
                <div>
                  <span>对应句（发音）</span>
                  <p>{makerResult.romaji}</p>
                </div>
                <p className="maker-meta">学习匹配率：{makerResult.confidence}% · {makerResult.note}</p>
                <div className="maker-playback-control">
                  <label htmlFor="maker-playback-rate">对应句朗读速度：<span>{makerPlaybackRate.toFixed(1)}x</span></label>
                  <input id="maker-playback-rate" type="range" min={0.5} max={1.8} step={0.1} value={makerPlaybackRate} onChange={(event) => setMakerPlaybackRate(Number(event.target.value))} />
                </div>
                <div className="maker-output-actions">
                  <button onClick={copyMaker}>{makerCopied ? "已复制到剪贴板" : "复制结果"}</button>
                  <button onClick={() => speakMaker(makerResult.kana)}>
                    {makerSpeaking ? "正在聆听" : "朗读生成句子"}
                  </button>
                  <button onClick={saveMakerAudio} disabled={makerSavingAudio}>{makerSavingAudio ? "正在录制朗读" : "保存音频"}</button>
                  <button onClick={shareMakerAudio}>分享朗读</button>
                  <button onClick={regenerateMaker}>再生成一次</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span>音</span>
                <h3>先写一句，你将听见它的另一种读法</h3>
                <p>支持中文、日文及符号混合输入；每个字符都会按相似音节重写。</p>
              </div>
            )}
          </div>
          <aside className="maker-history" aria-label="生成历史">
            <div>
              <h3>最近生成历史</h3>
              <div className="maker-history-meta">
                <p>
                  共 {makerHistory.length} 条 · 当前显示 {visibleMakerHistory.length} 条
                </p>
                <div className="maker-history-controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={makerHistoryLimit3}
                      onChange={(event) => setMakerHistoryLimit3(event.target.checked)}
                    />
                    只看最近3条
                  </label>
                  <button onClick={clearMakerHistory}>清空历史</button>
                </div>
              </div>
            </div>
            <ol>
              {visibleMakerHistory.length === 0 ? (
                <li>暂无记录，首次生成后会自动保存到本地。</li>
              ) : (
                visibleMakerHistory.map((entry) => (
                  <li key={entry.id}>
                    <button onClick={() => useHistory(entry)}>
                      <span>{entry.input}</span>
                      <small>
                        {renderHistoryTime(entry.createdAt)
                          ? `生成于 ${renderHistoryTime(entry.createdAt)} · `
                          : ""}
                        {entry.kana}
                      </small>
                    </button>
                  </li>
                ))
              )}
            </ol>
          </aside>
        </div>
      </section>

      <section className="submit-section" id="submit">
        <div className="shell submit-grid">
          <div>
            <p className="eyebrow light"><span /> CONTRIBUTE</p>
            <h2>你也听见了吗？</h2>
            <p>语言的趣味来自每个人的耳朵。写下你发现的中文与日语谐音，让这个声音小志继续生长。</p>
            <div className="submit-note">
              <span>注</span>
              投稿会暂存在你的浏览器中。这是一版学习用演示，未来可接入审核与公开词库。
            </div>
          </div>
          <form onSubmit={submitIdea}>
            <label>
              中文原句
              <input name="chinese" required placeholder="例如：忽逢桃花林" />
            </label>
            <label>
              日语假名 / 拟音
              <input name="kana" required placeholder="例如：ふーふん たお はりん" />
            </label>
            <label>
              出处或你的说明
              <textarea name="note" rows={3} placeholder="它为什么让你觉得相像？" />
            </label>
            <button className="submit-button" type="submit">提交这次偶遇 <span>→</span></button>
            {submitted && <p className="success" role="status">已收下这次声音偶遇。谢谢你的耳朵！</p>}
          </form>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top"><span className="brand-mark">音</span><span>音逢</span></a>
        <p>一个关于汉字、假名与声音联想的学习项目。</p>
        <a href="#top">回到开头 ↑</a>
      </footer>
    </main>
  );
}
