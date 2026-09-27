const entries = [
  { chinese: "忽逢桃花林", kana: "ふーふん たお はりん", romaji: "fu fun tao ha rin", source: "陶渊明《桃花源记》", category: "古文", score: 92, note: "像一阵风把桃花源的入口吹进了日语假名里。" },
  { chinese: "山有木兮木有枝", kana: "さん よう むー しー むー よう じー", romaji: "san yō mū shī mū yō jī", source: "《越人歌》", category: "诗词", score: 81, note: "舒展的元音，让古老诗句有了另一种节拍。" },
  { chinese: "清风明月", kana: "ちん ふう みん ゆえ", romaji: "chin fū min yue", source: "汉字音联想", category: "诗词", score: 86, note: "汉字音读与中文发音互相映照，清亮而短促。" },
  { chinese: "少年", kana: "しょうねん", romaji: "shōnen", source: "汉字词", category: "日常", score: 95, note: "同一组汉字，在两种语言里保留了熟悉的回声。" },
  { chinese: "上海", kana: "しゃんはい", romaji: "shan hai", source: "地名", category: "地名", score: 98, note: "日语对中文地名的音译，几乎可以隔岸相认。" },
  { chinese: "青山", kana: "せいざん", romaji: "seizan", source: "汉字音联想", category: "地名", score: 78, note: "不是完全相同，却像两座山在声音里遥相呼应。" }
];

const DEFAULT_PHONETIC_ROWS = [
  { id: "default-01", chars: "我,喔,窝", kana: "うぉ", romaji: "wo", note: "同音合并：wo 不区分声调，共用 /うぉ/。" },
  { id: "default-02", chars: "不,步,部,布", kana: "ぶ", romaji: "bu", note: "同音合并：bu 不区分声调，共用 /ぶ/。" },
  { id: "default-03", chars: "懂", kana: "どん", romaji: "don", note: "按“懂”音感归到 /don/ 区域。" },
  { id: "default-04", chars: "你", kana: "に", romaji: "ni", note: "按“你”音感归到 /ni/ 区域。" },
  { id: "default-05", chars: "他,她,它", kana: "た", romaji: "ta", note: "把“他/她/它”归为同音组，统一按 /ta/ 处理。" },
  { id: "default-06", chars: "中", kana: "ちゅう", romaji: "zhong", note: "中（zhong）音感近似。" },
  { id: "default-07", chars: "天", kana: "てん", romaji: "tian", note: "天（tian）可按日语长音延展。" },
  { id: "default-08", chars: "风", kana: "ふう", romaji: "feng", note: "风（feng）与“fū / hūn”类音段可近似。" },
  { id: "default-09", chars: "花", kana: "は", romaji: "hua", note: "花（hua）起始音接近 /wa/，保留 h/f 段落转写。" },
  { id: "default-10", chars: "来", kana: "らい", romaji: "lai", note: "来（lai）可读作连音 /rai/。" },
  { id: "default-11", chars: "明", kana: "みん", romaji: "ming", note: "按用户校对：ming 统一映射为 /みん/。" },
  { id: "default-12", chars: "月", kana: "ゆえ", romaji: "yue", note: "月使用 /ゆえ/。" },
  { id: "default-13", chars: "书", kana: "しゅ", romaji: "shu", note: "书（shu）常见日语读音骨架映射。" },
  { id: "default-14", chars: "文", kana: "ぶん", romaji: "wen", note: "文（wen）靠近日语 /bun/。" },
  { id: "default-15", chars: "火", kana: "ほ", romaji: "huo", note: "火（huo）可按 /ho/ 处理。" },
  { id: "default-16", chars: "水", kana: "すい", romaji: "shui", note: "水（shui）近似转写到 /sui/。" },
  { id: "default-17", chars: "山", kana: "さん", romaji: "shan", note: "山（shan）按日常借音 /san/。" },
  { id: "default-18", chars: "语,雨,羽,宇", kana: "ゆ", romaji: "yu", note: "同音合并：yu 不区分声调，共用 /ゆ/。" },
  { id: "default-19", chars: "好", kana: "はお", romaji: "hao", note: "好（hao）可按长音近音转写。" },
  { id: "default-20", chars: "见,间,件,建", kana: "けん", romaji: "jian", note: "同音合并：jian 不区分声调，共用 /けん/。" },
  { id: "default-21", chars: "日", kana: "り", romaji: "ri", note: "日（ri）可按 /ri/ 处理。" },
  { id: "default-22", chars: "人", kana: "じん", romaji: "ren", note: "人（ren）与日语 /jin/ 近。" },
  { id: "default-23", chars: "们", kana: "もん", romaji: "men", note: "们（men）常见收口音近似。" },
  { id: "default-24", chars: "年", kana: "ねん", romaji: "nian", note: "年（nian）按近似音写为 /nen/。" },
  { id: "default-25", chars: "东", kana: "どう", romaji: "dong", note: "东（dong）保留浊音，使用 /どう/。" },
  { id: "default-26", chars: "西,习,喜,细", kana: "し", romaji: "xi", note: "同音合并：xi 不区分声调，共用 /し/。" },
  { id: "default-27", chars: "爱", kana: "あい", romaji: "ai", note: "爱（ai）可直接转写为 /ai/。" },
  { id: "default-28", chars: "有,右,又,友", kana: "ゆう", romaji: "you", note: "同音合并：you 不区分声调，共用 /ゆう/。" },
  { id: "default-29", chars: "家", kana: "じあ", romaji: "jia", note: "按用户校对：jia 统一映射为 /じあ/。" },
  { id: "default-30", chars: "国", kana: "ごく", romaji: "guo", note: "国（guo）近似 /goku/ 的收口。" },
  { id: "default-31", chars: "学", kana: "がく", romaji: "xue", note: "学（xue）在借音逻辑里常见为 /gaku/。" },
  { id: "default-73", chars: "同", kana: "と", romaji: "tong", note: "同（tong）使用清音 /と/。" },
  { id: "default-32", chars: "生", kana: "せい", romaji: "sheng", note: "生（sheng）可借用 /sei/ 感。" },
  { id: "default-33", chars: "心", kana: "しん", romaji: "xin", note: "心（xin）偏近 /shin/。" },
  { id: "default-34", chars: "说", kana: "しゅお", romaji: "shuo", note: "说（shuo）可写作 /shuo/ 的近音版本。" },
  { id: "default-35", chars: "美,每,妹", kana: "めい", romaji: "mei", note: "同音合并：mei 不区分声调，共用 /めい/。" },
  { id: "default-36", chars: "话", kana: "は", romaji: "hua", note: "花、话同音，统一使用 /は/。" },
  { id: "default-37", chars: "有", kana: "ゆう", romaji: "you", note: "有（you）统一使用 /ゆう/。" },
  { id: "default-38", chars: "天", kana: "てん", romaji: "tian", note: "天（tian）延续原有近音，但保留 /ten/。" },
  { id: "default-39", chars: "大", kana: "だ", romaji: "da", note: "大（da）可用开口 /da/ 声段。" },
  { id: "default-40", chars: "小", kana: "しょう", romaji: "xiao", note: "小（xiao）偏音节可读作 /shō/。" },
  { id: "default-41", chars: "上", kana: "しよう", romaji: "shang", note: "上（shang）可做近似 /shō/ 展开。" },
  { id: "default-42", chars: "下,夏,瞎,峡,霞", kana: "しあ", romaji: "xia", note: "同音合并：xia 共用用户指定规则 / しあ /。", source: "manual", soundStatus: "same" },
  { id: "default-43", chars: "去", kana: "きょ", romaji: "qu", note: "去（qu）可音位接近 /kyo/。" },
  { id: "default-44", chars: "来", kana: "らい", romaji: "lai", note: "来（lai）强调连读入口。" },
  { id: "default-45", chars: "好", kana: "はお", romaji: "hao", note: "好（hao）可拉长音段。" },
  { id: "default-46", chars: "想", kana: "しゃん", romaji: "xiang", note: "想（xiang）可近似 /shang/。" },
  { id: "default-47", chars: "爱", kana: "あい", romaji: "ai", note: "爱（ai）常见直接转写。" },
  { id: "default-48", chars: "会,回", kana: "くえい", romaji: "hui", note: "同音合并：hui 不区分声调，共用 /くえい/。" },
  { id: "default-49", chars: "看", kana: "かん", romaji: "kan", note: "看（kan）可作 /kan/ 近音。" },
  { id: "default-50", chars: "说", kana: "しゅお", romaji: "shuo", note: "说（shuo）保持 /shuo/ 核心音节。" },
  { id: "default-51", chars: "听", kana: "てい", romaji: "ting", note: "听（ting）可按 /tei/ 近似。" },
  { id: "default-52", chars: "今", kana: "きん", romaji: "jin", note: "补充样本：以音节近似“jin”。", source: "generated" },
  { id: "default-53", chars: "红,虹", kana: "ほん", romaji: "hong", note: "同音合并：hong 共用 /ほん/。", source: "generated" },
  { id: "default-54", chars: "白", kana: "ばい", romaji: "bai", note: "补充样本：按 /bai/ 近似。", source: "generated" },
  { id: "default-55", chars: "蓝", kana: "らん", romaji: "lan", note: "补充样本：按 /lan/ 近似。", source: "generated" },
  { id: "default-56", chars: "绿,旅", kana: "りゅ", romaji: "lü", note: "同音合并：lü 共用 /りゅ/。", source: "generated" },
  { id: "default-57", chars: "黄", kana: "こう", romaji: "huang", note: "补充样本：按 /huang/ 的开口近似。", source: "generated" },
  { id: "default-58", chars: "新", kana: "しん", romaji: "xin", note: "补充样本：按 /xin/ 近似。", source: "generated" },
  { id: "default-59", chars: "旧", kana: "きゅう", romaji: "jiu", note: "补充样本：按 /giu/ 近似收束。", source: "generated" },
  { id: "default-60", chars: "老", kana: "ろう", romaji: "lao", note: "补充样本：按 /lao/ 延展音。", source: "generated" },
  { id: "default-61", chars: "少", kana: "しゃお", romaji: "shao", note: "补充样本：按 /shao/ 近似。", source: "generated" },
  { id: "default-62", chars: "路", kana: "る", romaji: "lu", note: "补充样本：按 /lu/ 的近似收口。", source: "generated" },
  { id: "default-63", chars: "起,七,期,气,器", kana: "き", romaji: "qi", note: "同音合并：qi 不区分声调，共用 /き/。", source: "generated", soundStatus: "same" },
  { id: "default-64", chars: "过", kana: "ごく", romaji: "guo", note: "国、过同音，统一使用 /ごく/。", source: "generated" },
  { id: "default-65", chars: "夜", kana: "や", romaji: "ye", note: "夜、也同音，统一使用 /や/。", source: "generated" },
  { id: "default-66", chars: "活", kana: "ほ", romaji: "huo", note: "火、活同音，统一使用 /ほ/。", source: "generated" },
  { id: "default-67", chars: "世", kana: "し", romaji: "shi", note: "使、是、事、市、世同音，统一使用 /し/。", source: "generated" },
  { id: "default-68", chars: "界", kana: "かい", romaji: "jie", note: "补充样本：按 /jie/ /jie/ 的开闭变化。", source: "generated" },
  { id: "default-70", chars: "光", kana: "ぐあん", romaji: "guang", note: "补充样本：按 /guang/ 做近似长音。", source: "generated" },
  { id: "default-71", chars: "情,轻,清", kana: "じょう", romaji: "qing", note: "同音合并：qing 共用现有手写规则 /じょう/。", source: "generated" },
  { id: "default-72", chars: "春", kana: "ちゅん", romaji: "chun", note: "修正拼音：春为 chun，使用 /ちゅん/。", source: "generated" },
  { id: "default-74", chars: "它,他她", kana: "た", romaji: "ta", note: "同音复用：ta 组不区分声调，统一套用 /た/。", source: "generated" },
  { id: "default-75", chars: "才,菜,彩", kana: "さい", romaji: "cai", note: "同音合并：cai 不区分声调，共用 /さい/。", source: "generated", soundStatus: "same" },
  { id: "default-77", chars: "白,百", kana: "ばい", romaji: "bai", note: "同音合并：不区分声调，共用 /ばい/。", source: "generated", soundStatus: "same" },
  { id: "default-78", chars: "班,办", kana: "ばん", romaji: "ban", note: "同音合并：不区分声调，共用 /ばん/。", source: "generated", soundStatus: "same" },
  { id: "default-80", chars: "方,放,房,防", kana: "ふぁん", romaji: "fang", note: "纠错：fang 按中文音感统一为 /ふぁん/。", source: "generated", soundStatus: "same" },
  { id: "default-82", chars: "高,告", kana: "こう", romaji: "gao", note: "同音合并：不区分声调，共用 /こう/。", source: "generated", soundStatus: "same" },
  { id: "default-84", chars: "看,刊", kana: "かん", romaji: "kan", note: "同音合并：不区分声调，共用 /かん/。", source: "generated", soundStatus: "same" },
  { id: "default-85", chars: "理,里", kana: "り", romaji: "li", note: "同音合并：不区分声调，共用 /り/。", source: "generated", soundStatus: "same" },
  { id: "default-86", chars: "米,迷", kana: "み", romaji: "mi", note: "同音合并：不区分声调，共用 /み/。", source: "generated", soundStatus: "same" },
  { id: "default-88", chars: "明,名", kana: "みん", romaji: "ming", note: "同音合并：ming 不区分声调，共用 /みん/。", source: "generated", soundStatus: "same" },
  { id: "default-89", chars: "书,输", kana: "しゅ", romaji: "shu", note: "同音合并：不区分声调，共用 /しゅ/。", source: "generated", soundStatus: "same" },
  { id: "default-90", chars: "同,童", kana: "と", romaji: "tong", note: "同音合并：不区分声调，共用清音 /と/。", source: "generated", soundStatus: "same" },
  { id: "default-91", chars: "问,稳", kana: "ぶん", romaji: "wen", note: "文、问、稳同音，统一使用 /ぶん/。", source: "generated", soundStatus: "same" },
  { id: "default-92", chars: "真,针", kana: "しん", romaji: "zhen", note: "同音合并：不区分声调，共用 /しん/。", source: "generated", soundStatus: "same" },
  { id: "default-93", chars: "朋,棚", kana: "ぽん", romaji: "peng", note: "新音组：peng 近似 /ぽん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-94", chars: "纸,只", kana: "し", romaji: "zhi", note: "新音组：zhi 近似 /し/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-95", chars: "冰,兵", kana: "びん", romaji: "bing", note: "新音组：bing 近似 /びん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-96", chars: "早,找", kana: "そう", romaji: "zao", note: "新音组：zao 近似 /そう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-97", chars: "快,块", kana: "かい", romaji: "kuai", note: "新音组：kuai 近似 /かい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-98", chars: "电,店", kana: "てん", romaji: "dian", note: "新音组：dian 近似 /てん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-99", chars: "远,园", kana: "えん", romaji: "yuan", note: "新音组：yuan 近似 /えん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-100", chars: "开,凯", kana: "かい", romaji: "kai", note: "新音组：kai 近似 /かい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-101", chars: "安,按", kana: "あん", romaji: "an", note: "新音组：an 近似 /あん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-102", chars: "包,报", kana: "ほう", romaji: "bao", note: "新音组：bao 近似 /ほう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-103", chars: "草,早", kana: "そう", romaji: "cao", note: "同音合并：cao 与 zao 音节接近，共用 /そう/。", source: "generated", soundStatus: "same" },
  { id: "default-104", chars: "长,常", kana: "ちょう", romaji: "chang", note: "同音合并：chang 不区分声调，共用 /ちょう/。", source: "generated", soundStatus: "same" },
  { id: "default-105", chars: "成,城", kana: "つえん", romaji: "cheng", note: "同音合并：cheng 使用 /つえん/。", source: "generated", soundStatus: "same" },
  { id: "default-106", chars: "出,初", kana: "しゅつ", romaji: "chu", note: "同音合并：chu 近似 /しゅつ/。", source: "generated", soundStatus: "same" },
  { id: "default-107", chars: "多,都", kana: "と", romaji: "duo", note: "新音组：duo 近似 /と/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-108", chars: "飞,非,啡", kana: "ひ", romaji: "fei", note: "同音合并：fei 近似 /ひ/。", source: "generated", soundStatus: "same" },
  { id: "default-109", chars: "古,鼓,故", kana: "こ", romaji: "gu", note: "同音合并：gu 近似 /こ/。", source: "generated", soundStatus: "same" },
  { id: "default-110", chars: "海,还,孩", kana: "はい", romaji: "hai", note: "同音合并：hai 近似 /はい/。", source: "generated", soundStatus: "same" },
  { id: "default-111", chars: "近,进", kana: "きん", romaji: "jin", note: "同音合并：jin 近似 /きん/。", source: "generated", soundStatus: "same" },
  { id: "default-112", chars: "空,控", kana: "くう", romaji: "kong", note: "新音组：kong 近似 /くう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-113", chars: "老,劳", kana: "ろう", romaji: "lao", note: "同音合并：lao 不区分声调，共用 /ろう/。", source: "generated", soundStatus: "same" },
  { id: "default-114", chars: "妈,麻,马,吗", kana: "ま", romaji: "ma", note: "同音合并：ma 不区分声调，共用 /ま/。", source: "generated", soundStatus: "same" },
  { id: "default-115", chars: "使,是,事,市,世,十,时,石", kana: "し", romaji: "shi", note: "同音合并：shi 不区分声调，共用 /し/。", source: "generated", soundStatus: "same" },
  { id: "default-116", chars: "的,得", kana: "で", romaji: "de", note: "同音合并：de 使用浊音 /で/。", source: "generated", soundStatus: "same" },
  { id: "default-117", chars: "了", kana: "りょう", romaji: "le", note: "常用字：le 近似 /りょう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-118", chars: "在,再", kana: "さい", romaji: "zai", note: "同音合并：zai 近似 /さい/。", source: "generated", soundStatus: "same" },
  { id: "default-119", chars: "和,喝,河,合", kana: "へ", romaji: "he", note: "纠错：按中文 he 音译为 /へ/，不使用意译式 /わ/。", source: "generated", soundStatus: "same" },
  { id: "default-120", chars: "旧,就,九,酒", kana: "きゅう", romaji: "jiu", note: "同音合并：jiu 不区分声调，共用 /きゅう/。", source: "generated", soundStatus: "same" },
  { id: "default-121", chars: "把,八,巴", kana: "は", romaji: "ba", note: "同音合并：ba 不区分声调，共用 /は/。", source: "generated", soundStatus: "same" },
  { id: "default-122", chars: "被,备,杯,北,背,倍,悲,贝,辈,碑,蓓,惫", kana: "ベイ", romaji: "bei", note: "同音合并：bei 共用用户指定规则 / ベイ /。", source: "manual", soundStatus: "same" },
  { id: "default-123", chars: "从", kana: "つ", romaji: "cong", note: "常用字：cong 近似 /つ/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-124", chars: "到", kana: "どう", romaji: "dao", note: "常用字：dao 使用浊音 /どう/。", source: "generated", soundStatus: "new" },
  { id: "default-125", chars: "让", kana: "らん", romaji: "rang", note: "常用字：rang 近似 /らん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-126", chars: "能", kana: "のう", romaji: "neng", note: "常用字：neng 近似 /のう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-127", chars: "要", kana: "よう", romaji: "yao", note: "常用字：yao 近似 /よう/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-128", chars: "夜,也", kana: "や", romaji: "ye", note: "同音合并：ye 不区分声调，共用 /や/。", source: "generated", soundStatus: "same" },
  { id: "default-129", chars: "很", kana: "へん", romaji: "hen", note: "常用字：hen 近似 /へん/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-130", chars: "最", kana: "さい", romaji: "zui", note: "常用字：zui 近似 /さい/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-131", chars: "可", kana: "か", romaji: "ke", note: "常用字：ke 近似 /か/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-132", chars: "一,衣,医,以", kana: "い", romaji: "yi", note: "同音合并：yi 不区分声调，共用 /い/。", source: "generated", soundStatus: "same" },
  { id: "default-133", chars: "那", kana: "な", romaji: "na", note: "常用字：na 近似 /な/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-134", chars: "个", kana: "こ", romaji: "ge", note: "常用字：ge 近似 /こ/，请检查。", source: "generated", soundStatus: "new" },
  { id: "default-135", chars: "二,儿,耳", kana: "あー", romaji: "er", note: "第一轮：er 近似 /あー/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-136", chars: "三,伞,散", kana: "さん", romaji: "san", note: "同音合并：san 不区分声调，共用 /さん/。", source: "generated", soundStatus: "same" },
  { id: "default-137", chars: "四,死", kana: "す", romaji: "si", note: "第一轮：si 近似 /す/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-138", chars: "五,舞", kana: "う", romaji: "wu", note: "第二轮：wu 近似 /う/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-139", chars: "六,流", kana: "りゅう", romaji: "liu", note: "第二轮：liu 近似 /りゅう/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-140", chars: "前,钱", kana: "ちえん", romaji: "qian", note: "第二轮：qian 近似 /ちえん/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-141", chars: "后,候", kana: "ほう", romaji: "hou", note: "第三轮：hou 近似 /ほう/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-142", chars: "左,佐,坐,作", kana: "ぞ", romaji: "zuo", note: "同音合并：zuo 不区分声调，共用 /ぞ/。", source: "generated", soundStatus: "same" },
  { id: "default-143", chars: "内", kana: "ねい", romaji: "nei", note: "第三轮：nei 近似 /ねい/，已检查。", source: "generated", soundStatus: "same" },
  { id: "default-144", chars: "外", kana: "わい", romaji: "wai", note: "第四轮新增：wai 近似 /わい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-145", chars: "头,投", kana: "とう", romaji: "tou", note: "第四轮新增：tou 近似 /とう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-146", chars: "手,首", kana: "しょう", romaji: "shou", note: "第四轮新增：shou 近似 /しょう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-147", chars: "脚,角,叫", kana: "じゃお", romaji: "jiao", note: "同音合并：jiao 共用 /じゃお/。", source: "generated", soundStatus: "same" },
  { id: "default-148", chars: "眼,演,沿", kana: "えん", romaji: "yan", note: "同音合并：yan 共用 /えん/。", source: "generated", soundStatus: "same" },
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
  { id: "default-463", chars: "知,直", kana: "じ", romaji: "zhi", note: "常见字补充：zhi 近似 /じ/。", source: "generated", soundStatus: "new" },
  { id: "default-464", chars: "坏", kana: "ふぁい", romaji: "huai", note: "常见字补充：huai 近似 /ふぁい/。", source: "generated", soundStatus: "new" },
  { id: "default-465", chars: "母", kana: "む", romaji: "mu", note: "常见字补充：mu 近似 /む/。", source: "generated", soundStatus: "new" },
  { id: "default-466", chars: "站", kana: "じゃん", romaji: "zhan", note: "常见字补充：zhan 近似 /じゃん/。", source: "generated", soundStatus: "new" },
  { id: "default-467", chars: "买,卖", kana: "まい", romaji: "mai", note: "同音合并：mai 共用 /まい/。", source: "generated", soundStatus: "new" },
  { id: "default-468", chars: "南,难,男", kana: "なん", romaji: "nan", note: "同音合并：nan 共用 /なん/。", source: "generated", soundStatus: "new" },
  { id: "default-469", chars: "需,续", kana: "しゅ", romaji: "xu", note: "同音合并：xu 近似 /しゅ/。", source: "generated", soundStatus: "new" },
  { id: "default-470", chars: "该", kana: "がい", romaji: "gai", note: "常见字补充：gai 近似 /がい/。", source: "generated", soundStatus: "new" },
  { id: "default-471", chars: "因,音", kana: "いん", romaji: "yin", note: "同音合并：yin 共用 /いん/。", source: "generated", soundStatus: "new" },
  { id: "default-472", chars: "为", kana: "うぇい", romaji: "wei", note: "常见字补充：wei 近似 /うぇい/。", source: "generated", soundStatus: "new" },
  { id: "default-473", chars: "所", kana: "すお", romaji: "suo", note: "常见字补充：suo 近似 /すお/。", source: "generated", soundStatus: "new" },
  { id: "default-474", chars: "怎", kana: "ぜん", romaji: "zen", note: "常见字补充：zen 近似 /ぜん/。", source: "generated", soundStatus: "new" },
  { id: "default-475", chars: "题", kana: "てぃ", romaji: "ti", note: "常见字补充：ti 近似 /てぃ/。", source: "generated", soundStatus: "new" },
  { id: "default-476", chars: "法,发", kana: "ふぁ", romaji: "fa", note: "同音合并：fa 共用 /ふぁ/。", source: "generated", soundStatus: "new" },
  { id: "default-477", chars: "地,第", kana: "でぃ", romaji: "di", note: "同音合并：di 共用 /でぃ/。", source: "generated", soundStatus: "new" },
  { id: "default-478", chars: "言", kana: "いぇん", romaji: "yan", note: "常见字补充：yan 近似 /いぇん/。", source: "generated", soundStatus: "new" },
  { id: "default-479", chars: "校,笑", kana: "しあ", romaji: "xiao", note: "同音合并：xiao 近似 /しあ/。", source: "generated", soundStatus: "new" },
  { id: "default-480", chars: "农", kana: "のん", romaji: "nong", note: "常见字补充：nong 近似 /のん/。", source: "generated", soundStatus: "new" },
  { id: "default-481", chars: "游", kana: "よう", romaji: "you", note: "常见字补充：you 近似 /よう/。", source: "generated", soundStatus: "new" },
  { id: "default-482", chars: "戏,希", kana: "し", romaji: "xi", note: "同音合并：xi 共用 /し/。", source: "generated", soundStatus: "new" },
  { id: "default-483", chars: "秋", kana: "ちゅう", romaji: "qiu", note: "常见字补充：qiu 近似 /ちゅう/。", source: "generated", soundStatus: "new" },
  { id: "default-484", chars: "哭", kana: "く", romaji: "ku", note: "常见字补充：ku 近似 /く/。", source: "generated", soundStatus: "new" },
  { id: "default-485", chars: "跑", kana: "ぱお", romaji: "pao", note: "常见字补充：pao 近似 /ぱお/。", source: "generated", soundStatus: "new" },
  { id: "default-486", chars: "跳", kana: "てぃあお", romaji: "tiao", note: "常见字补充：tiao 近似 /てぃあお/。", source: "generated", soundStatus: "new" },
  { id: "default-487", chars: "写", kana: "しえ", romaji: "xie", note: "常见字补充：xie 近似 /しえ/。", source: "generated", soundStatus: "new" },
  { id: "default-488", chars: "入", kana: "る", romaji: "ru", note: "常见字补充：ru 近似 /る/。", source: "generated", soundStatus: "new" },
  { id: "default-489", chars: "望", kana: "わん", romaji: "wang", note: "常见字补充：wang 近似 /わん/。", source: "generated", soundStatus: "new" },
  { id: "default-490", chars: "用", kana: "よん", romaji: "yong", note: "常见字补充：yong 近似 /よん/。", source: "generated", soundStatus: "new" },
  { id: "default-491", chars: "确", kana: "ちゅえ", romaji: "que", note: "常见字补充：que 近似 /ちゅえ/。", source: "generated", soundStatus: "new" },
  { id: "default-492", chars: "误", kana: "う", romaji: "wu", note: "常见字补充：wu 近似 /う/。", source: "generated", soundStatus: "new" },
  { id: "default-493", chars: "杂", kana: "ざ", romaji: "za", note: "常见字补充：za 近似 /ざ/。", source: "generated", soundStatus: "new" },
  { id: "default-494", chars: "重", kana: "じょん", romaji: "zhong", note: "常见字补充：zhong 近似 /じょん/。", source: "generated", soundStatus: "new" },
  { id: "default-495", chars: "特", kana: "て", romaji: "te", note: "常见字补充：te 近似 /て/。", source: "generated", soundStatus: "new" },
  { id: "default-496", chars: "完", kana: "わん", romaji: "wan", note: "常见字补充：wan 近似 /わん/。", source: "generated", soundStatus: "new" },
  { id: "default-497", chars: "与", kana: "ゆ", romaji: "yu", note: "常见字补充：yu 近似 /ゆ/。", source: "generated", soundStatus: "new" },
  { id: "default-498", chars: "给", kana: "げい", romaji: "gei", note: "常见字补充：gei 近似 /げい/。", source: "generated", soundStatus: "new" },
  { id: "default-499", chars: "如", kana: "る", romaji: "ru", note: "常见字补充：ru 近似 /る/。", source: "generated", soundStatus: "new" },
  { id: "default-500", chars: "已,椅,宜,议", kana: "い", romaji: "yi", note: "同音合并：yi 共用 /い/。", source: "generated", soundStatus: "new" },
  { id: "default-501", chars: "什,身", kana: "しぇん", romaji: "shen", note: "同音合并：shen 近似 /しぇん/。", source: "generated", soundStatus: "new" },
  { id: "default-502", chars: "么", kana: "め", romaji: "me", note: "常见字补充：me 近似 /め/。", source: "generated", soundStatus: "new" },
  { id: "default-503", chars: "乐", kana: "れ", romaji: "le", note: "常见字补充：le 近似 /れ/。", source: "generated", soundStatus: "new" },
  { id: "default-504", chars: "兴,姓", kana: "しん", romaji: "xing", note: "同音合并：xing 共用 /しん/。", source: "generated", soundStatus: "new" },
  { id: "default-505", chars: "女", kana: "にゅ", romaji: "nü", note: "常见字补充：nü 近似 /にゅ/。", source: "generated", soundStatus: "new" },
  { id: "default-506", chars: "些,谢", kana: "しえ", romaji: "xie", note: "同音合并：xie 共用 /しえ/。", source: "generated", soundStatus: "new" },
  { id: "default-507", chars: "始,视", kana: "し", romaji: "shi", note: "同音合并：shi 共用 /し/。", source: "generated", soundStatus: "new" },
  { id: "default-508", chars: "结", kana: "じえ", romaji: "jie", note: "常见字补充：jie 近似 /じえ/。", source: "generated", soundStatus: "new" },
  { id: "default-509", chars: "辑,继", kana: "じ", romaji: "ji", note: "同音合并：ji 共用 /じ/。", source: "generated", soundStatus: "new" },
  { id: "default-510", chars: "选", kana: "しゅあん", romaji: "xuan", note: "常见字补充：xuan 近似 /しゅあん/。", source: "generated", soundStatus: "new" },
  { id: "default-511", chars: "择", kana: "ぜ", romaji: "ze", note: "常见字补充：ze 近似 /ぜ/。", source: "generated", soundStatus: "new" },
  { id: "default-512", chars: "您", kana: "にん", romaji: "nin", note: "常见字补充：nin 近似 /にん/。", source: "generated", soundStatus: "new" },
  { id: "default-513", chars: "岁", kana: "すい", romaji: "sui", note: "常见字补充：sui 近似 /すい/。", source: "generated", soundStatus: "new" },
  { id: "default-514", chars: "系,息", kana: "し", romaji: "xi", note: "同音合并：xi 共用 /し/。", source: "generated", soundStatus: "new" },
  { id: "default-515", chars: "院,原", kana: "ゆえん", romaji: "yuan", note: "同音合并：yuan 近似 /ゆえん/。", source: "generated", soundStatus: "new" },
  { id: "default-516", chars: "钟", kana: "じょん", romaji: "zhong", note: "常见字补充：zhong 近似 /じょん/。", source: "generated", soundStatus: "new" },
  { id: "default-517", chars: "昨,做", kana: "ずお", romaji: "zuo", note: "同音合并：zuo 共用 /ずお/。", source: "generated", soundStatus: "new" },
  { id: "default-518", chars: "热", kana: "れ", romaji: "re", note: "常见字补充：re 近似 /れ/。", source: "generated", soundStatus: "new" },
  { id: "default-519", chars: "苹", kana: "ぴん", romaji: "ping", note: "常见字补充：ping 近似 /ぴん/。", source: "generated", soundStatus: "new" },
  { id: "default-520", chars: "颜", kana: "いぇん", romaji: "yan", note: "常见字补充：yan 近似 /いぇん/。", source: "generated", soundStatus: "new" },
  { id: "default-521", chars: "色", kana: "せ", romaji: "se", note: "常见字补充：se 近似 /せ/。", source: "generated", soundStatus: "new" },
  { id: "default-522", chars: "铁", kana: "てぃえ", romaji: "tie", note: "常见字补充：tie 近似 /てぃえ/。", source: "generated", soundStatus: "new" },
  { id: "default-523", chars: "租,足", kana: "ず", romaji: "zu", note: "同音合并：zu 共用 /ず/。", source: "generated", soundStatus: "new" },
  { id: "default-524", chars: "银", kana: "いん", romaji: "yin", note: "常见字补充：yin 近似 /いん/。", source: "generated", soundStatus: "new" },
  { id: "default-525", chars: "邮", kana: "よう", romaji: "you", note: "常见字补充：you 近似 /よう/。", source: "generated", soundStatus: "new" },
  { id: "default-526", chars: "超", kana: "ちゃお", romaji: "chao", note: "常见字补充：chao 近似 /ちゃお/。", source: "generated", soundStatus: "new" },
  { id: "default-527", chars: "务,午", kana: "う", romaji: "wu", note: "同音合并：wu 共用 /う/。", source: "generated", soundStatus: "new" },
  { id: "default-528", chars: "体,提", kana: "てぃ", romaji: "ti", note: "同音合并：ti 共用 /てぃ/。", source: "generated", soundStatus: "new" },
  { id: "default-529", chars: "健", kana: "じえん", romaji: "jian", note: "常见字补充：jian 近似 /じえん/。", source: "generated", soundStatus: "new" },
  { id: "default-530", chars: "药", kana: "やお", romaji: "yao", note: "常见字补充：yao 近似 /やお/。", source: "generated", soundStatus: "new" },
  { id: "default-531", chars: "休", kana: "しゅう", romaji: "xiu", note: "常见字补充：xiu 近似 /しゅう/。", source: "generated", soundStatus: "new" },
  { id: "default-532", chars: "运", kana: "ゆん", romaji: "yun", note: "常见字补充：yun 近似 /ゆん/。", source: "generated", soundStatus: "new" },
  { id: "default-533", chars: "泳", kana: "よん", romaji: "yong", note: "常见字补充：yong 近似 /よん/。", source: "generated", soundStatus: "new" },
  { id: "default-534", chars: "球", kana: "ちゅう", romaji: "qiu", note: "常见字补充：qiu 近似 /ちゅう/。", source: "generated", soundStatus: "new" },
  { id: "default-535", chars: "必,闭", kana: "び", romaji: "bi", note: "同音合并：bi 共用 /び/。", source: "generated", soundStatus: "new" },
  { id: "default-536", chars: "须", kana: "しゅ", romaji: "xu", note: "常见字补充：xu 近似 /しゅ/。", source: "generated", soundStatus: "new" },
  { id: "default-537", chars: "努", kana: "ぬ", romaji: "nu", note: "常见字补充：nu 近似 /ぬ/。", source: "generated", soundStatus: "new" },
  { id: "default-538", chars: "感", kana: "がん", romaji: "gan", note: "常见字补充：gan 近似 /がん/。", source: "generated", soundStatus: "new" },
  { id: "default-539", chars: "改", kana: "がい", romaji: "gai", note: "常见字补充：gai 近似 /がい/。", source: "generated", soundStatus: "new" },
  { id: "default-540", chars: "增", kana: "ぜん", romaji: "zeng", note: "常见字补充：zeng 近似 /ぜん/。", source: "generated", soundStatus: "new" },
  { id: "default-541", chars: "诉", kana: "す", romaji: "su", note: "常见字补充：su 近似 /す/。", source: "generated", soundStatus: "new" },
  { id: "default-542", chars: "忘", kana: "わん", romaji: "wang", note: "常见字补充：wang 近似 /わん/。", source: "generated", soundStatus: "new" },
  { id: "default-543", chars: "送", kana: "そん", romaji: "song", note: "常见字补充：song 近似 /そん/。", source: "generated", soundStatus: "new" },
  { id: "default-544", chars: "爷", kana: "や", romaji: "ye", note: "常见字补充：ye 复用 /や/。", source: "generated", soundStatus: "new" },
  { id: "default-545", chars: "奶", kana: "ない", romaji: "nai", note: "常见字补充：nai 近似 /ない/。", source: "generated", soundStatus: "new" },
  { id: "default-546", chars: "叔,蔬", kana: "しゅ", romaji: "shu", note: "同音合并：shu 共用 /しゅ/。", source: "generated", soundStatus: "new" },
  { id: "default-547", chars: "阿", kana: "あ", romaji: "a", note: "常见字补充：a 直接使用 /あ/。", source: "generated", soundStatus: "new" },
  { id: "default-548", chars: "姨,意,易", kana: "い", romaji: "yi", note: "同音合并：yi 共用 /い/。", source: "generated", soundStatus: "new" },
  { id: "default-549", chars: "婴", kana: "いん", romaji: "ying", note: "常见字补充：ying 复用 /いん/。", source: "generated", soundStatus: "new" },
  { id: "default-550", chars: "幼,油", kana: "ゆう", romaji: "you", note: "同音合并：you 共用 /ゆう/。", source: "generated", soundStatus: "new" },
  { id: "default-551", chars: "青", kana: "じょう", romaji: "qing", note: "常见字补充：qing 复用现有 /じょう/。", source: "generated", soundStatus: "new" },
  { id: "default-552", chars: "伙,或", kana: "ほ", romaji: "huo", note: "同音合并：huo 共用 /ほ/。", source: "generated", soundStatus: "new" },
  { id: "default-553", chars: "员,愿", kana: "えん", romaji: "yuan", note: "同音合并：yuan 共用 /えん/。", source: "generated", soundStatus: "new" },
  { id: "default-554", chars: "民", kana: "みん", romaji: "min", note: "常见字补充：min 近似 /みん/。", source: "generated", soundStatus: "new" },
  { id: "default-555", chars: "社", kana: "しぇ", romaji: "she", note: "常见字补充：she 近似 /しぇ/。", source: "generated", soundStatus: "new" },
  { id: "default-556", chars: "济", kana: "じ", romaji: "ji", note: "常见字补充：ji 复用 /じ/。", source: "generated", soundStatus: "new" },
  { id: "default-557", chars: "政", kana: "じぇん", romaji: "zheng", note: "常见字补充：zheng 复用 /じぇん/。", source: "generated", soundStatus: "new" },
  { id: "default-558", chars: "治,植,志,止", kana: "し", romaji: "zhi", note: "同音合并：zhi 共用 /し/。", source: "generated", soundStatus: "new" },
  { id: "default-559", chars: "育,于", kana: "ゆ", romaji: "yu", note: "同音合并：yu 共用 /ゆ/。", source: "generated", soundStatus: "new" },
  { id: "default-560", chars: "物", kana: "う", romaji: "wu", note: "常见字补充：wu 复用 /う/。", source: "generated", soundStatus: "new" },
  { id: "default-561", chars: "品", kana: "ぴん", romaji: "pin", note: "常见字补充：pin 近似 /ぴん/。", source: "generated", soundStatus: "new" },
  { id: "default-562", chars: "饮", kana: "いん", romaji: "yin", note: "常见字补充：yin 复用 /いん/。", source: "generated", soundStatus: "new" },
  { id: "default-563", chars: "料", kana: "りあお", romaji: "liao", note: "常见字补充：liao 近似 /りあお/。", source: "generated", soundStatus: "new" },
  { id: "default-564", chars: "肉", kana: "ろう", romaji: "rou", note: "常见字补充：rou 近似 /ろう/。", source: "generated", soundStatus: "new" },
  { id: "default-565", chars: "盐", kana: "えん", romaji: "yan", note: "常见字补充：yan 复用 /えん/。", source: "generated", soundStatus: "new" },
  { id: "default-566", chars: "糖", kana: "たん", romaji: "tang", note: "常见字补充：tang 近似 /たん/。", source: "generated", soundStatus: "new" },
  { id: "default-567", chars: "桥", kana: "ちあお", romaji: "qiao", note: "常见字补充：qiao 近似 /ちあお/。", source: "generated", soundStatus: "new" },
  { id: "default-568", chars: "层", kana: "つぇん", romaji: "ceng", note: "常见字补充：ceng 近似 /つぇん/。", source: "generated", soundStatus: "new" },
  { id: "default-569", chars: "梯", kana: "てぃ", romaji: "ti", note: "常见字补充：ti 复用 /てぃ/。", source: "generated", soundStatus: "new" },
  { id: "default-570", chars: "卧", kana: "うぉ", romaji: "wo", note: "常见字补充：wo 复用 /うぉ/。", source: "generated", soundStatus: "new" },
  { id: "default-571", chars: "墙", kana: "ちあん", romaji: "qiang", note: "常见字补充：qiang 近似 /ちあん/。", source: "generated", soundStatus: "new" },
  { id: "default-572", chars: "片", kana: "ぴえん", romaji: "pian", note: "常见字补充：pian 近似 /ぴえん/。", source: "generated", soundStatus: "new" },
  { id: "default-573", chars: "箱,相", kana: "しゃん", romaji: "xiang", note: "同音合并：xiang 共用 /しゃん/。", source: "generated", soundStatus: "new" },
  { id: "default-574", chars: "鞋", kana: "しえ", romaji: "xie", note: "常见字补充：xie 复用 /しえ/。", source: "generated", soundStatus: "new" },
  { id: "default-575", chars: "袜", kana: "わ", romaji: "wa", note: "常见字补充：wa 近似 /わ/。", source: "generated", soundStatus: "new" },
  { id: "default-576", chars: "钥", kana: "よう", romaji: "yao", note: "常见字补充：yao 复用 /よう/。", source: "generated", soundStatus: "new" },
  { id: "default-577", chars: "匙,示", kana: "し", romaji: "shi", note: "同音合并：shi 共用 /し/。", source: "generated", soundStatus: "new" },
  { id: "default-578", chars: "笔,比", kana: "び", romaji: "bi", note: "同音合并：bi 共用 /び/。", source: "generated", soundStatus: "new" },
  { id: "default-579", chars: "未", kana: "うぇい", romaji: "wei", note: "常见字补充：wei 复用 /うぇい/。", source: "generated", soundStatus: "new" },
  { id: "default-580", chars: "虽", kana: "すい", romaji: "sui", note: "常见字补充：sui 复用 /すい/。", source: "generated", soundStatus: "new" },
  { id: "default-581", chars: "且", kana: "ちえ", romaji: "qie", note: "常见字补充：qie 近似 /ちえ/。", source: "generated", soundStatus: "new" },
  { id: "default-582", chars: "其", kana: "き", romaji: "qi", note: "常见字补充：qi 复用 /き/。", source: "generated", soundStatus: "new" },
  { id: "default-583", chars: "终", kana: "ちゅう", romaji: "zhong", note: "常见字补充：zhong 复用 /ちゅう/。", source: "generated", soundStatus: "new" },
  { id: "default-584", chars: "突", kana: "とぅ", romaji: "tu", note: "常见字补充：tu 复用 /とぅ/。", source: "generated", soundStatus: "new" },
  { id: "default-585", chars: "当", kana: "だん", romaji: "dang", note: "常见字补充：dang 近似 /だん/。", source: "generated", soundStatus: "new" },
  { id: "default-586", chars: "许", kana: "しゅ", romaji: "xu", note: "常见字补充：xu 复用 /しゅ/。", source: "generated", soundStatus: "new" },
  { id: "default-587", chars: "太", kana: "たい", romaji: "tai", note: "常见字补充：tai 近似 /たい/。", source: "generated", soundStatus: "new" },
  { id: "default-588", chars: "各", kana: "こ", romaji: "ge", note: "常见字补充：ge 复用 /こ/。", source: "generated", soundStatus: "new" },
  { id: "default-589", chars: "样", kana: "やん", romaji: "yang", note: "常见字补充：yang 复用 /やん/。", source: "generated", soundStatus: "new" },
  { id: "default-590", chars: "容", kana: "ろん", romaji: "rong", note: "常见字补充：rong 近似 /ろん/。", source: "generated", soundStatus: "new" },
  { id: "default-591", chars: "信", kana: "しん", romaji: "xin", note: "常见字补充：xin 复用 /しん/。", source: "generated", soundStatus: "new" },
  { id: "default-592", chars: "掉", kana: "でぃあお", romaji: "diao", note: "常见字补充：diao 近似 /でぃあお/。", source: "generated", soundStatus: "new" },
  { id: "default-593", chars: "持", kana: "ち", romaji: "chi", note: "常见字补充：chi 复用 /ち/。", source: "generated", soundStatus: "new" },
  { id: "default-594", chars: "求", kana: "ちゅう", romaji: "qiu", note: "常见字补充：qiu 复用 /ちゅう/。", source: "generated", soundStatus: "new" },
  { id: "default-595", chars: "寻", kana: "しゅん", romaji: "xun", note: "常见字补充：xun 近似 /しゅん/。", source: "generated", soundStatus: "new" },
  { id: "default-596", chars: "崩", kana: "べん", romaji: "beng", note: "标准音节补缺：beng 对应 /べん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-597", chars: "擦", kana: "つぁ", romaji: "ca", note: "标准音节补缺：ca 对应 /つぁ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-598", chars: "仓", kana: "つぁん", romaji: "cang", note: "标准音节补缺：cang 对应 /つぁん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-599", chars: "岑", kana: "つぇん", romaji: "cen", note: "标准音节补缺：cen 对应 /つぇん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-600", chars: "柴,拆", kana: "ちゃい", romaji: "chai", note: "标准音节补缺：chai 对应 /ちゃい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-601", chars: "欻", kana: "ちゅあ", romaji: "chua", note: "标准音节补缺：chua 对应 /ちゅあ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-602", chars: "揣,踹", kana: "ちゅあい", romaji: "chuai", note: "标准音节补缺：chuai 对应 /ちゅあい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-603", chars: "吹,垂", kana: "ちゅい", romaji: "chui", note: "标准音节补缺：chui 对应 /ちゅい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-604", chars: "戳,绰", kana: "ちゅお", romaji: "chuo", note: "标准音节补缺：chuo 对应 /ちゅお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-605", chars: "凑", kana: "つぉう", romaji: "cou", note: "标准音节补缺：cou 对应 /つぉう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-606", chars: "窜,攒", kana: "つあん", romaji: "cuan", note: "标准音节补缺：cuan 对应 /つあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-607", chars: "嘚", kana: "でい", romaji: "dei", note: "标准音节补缺：dei 对应 /でい/；保留“得”的常用 de 读法。", source: "generated", soundStatus: "new" },
  { id: "default-608", chars: "爹,跌,迭,谍,叠,蝶", kana: "でぃえ", romaji: "die", note: "标准音节补缺：die 对应 /でぃえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-609", chars: "丢", kana: "でぃう", romaji: "diu", note: "标准音节补缺：diu 对应 /でぃう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-610", chars: "兜,抖,斗,豆,逗", kana: "どう", romaji: "dou", note: "标准音节补缺：dou 对应 /どう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-611", chars: "恩", kana: "えん", romaji: "en", note: "标准音节补缺：en 对应 /えん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-612", chars: "鞥", kana: "えん", romaji: "eng", note: "标准音节补缺：eng 对应 /えん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-613", chars: "佛", kana: "ふぉ", romaji: "fo", note: "标准音节补缺：fo 对应 /ふぉ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-614", chars: "否", kana: "ふぉう", romaji: "fou", note: "标准音节补缺：fou 对应 /ふぉう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-615", chars: "嘎,尬", kana: "が", romaji: "ga", note: "标准音节补缺：ga 对应 /が/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-616", chars: "根,跟", kana: "げん", romaji: "gen", note: "标准音节补缺：gen 对应 /げん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-617", chars: "卷,捐", kana: "じゅあん", romaji: "juan", note: "标准音节补缺：juan 对应 /じゅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-618", chars: "亏,葵,愧", kana: "くい", romaji: "kui", note: "标准音节补缺：kui 对应 /くい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-619", chars: "扩,阔,括", kana: "くお", romaji: "kuo", note: "标准音节补缺：kuo 对应 /くお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-620", chars: "乱,卵,峦", kana: "るあん", romaji: "luan", note: "标准音节补缺：luan 对应 /るあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-621", chars: "论,轮,伦", kana: "るん", romaji: "lun", note: "标准音节补缺：lun 对应 /るん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-622", chars: "罗,落,洛,裸,骆", kana: "るお", romaji: "luo", note: "标准音节补缺：luo 对应 /るお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-623", chars: "略", kana: "りゅえ", romaji: "lüe", note: "标准音节补缺：lüe 对应 /りゅえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-624", chars: "忙,芒,盲,茫", kana: "まん", romaji: "mang", note: "标准音节补缺：mang 对应 /まん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-625", chars: "梦,猛,蒙", kana: "もん", romaji: "meng", note: "标准音节补缺：meng 对应 /もん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-626", chars: "面,棉,免", kana: "みえん", romaji: "mian", note: "标准音节补缺：mian 对应 /みえん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-627", chars: "秒,苗,妙", kana: "みあお", romaji: "miao", note: "标准音节补缺：miao 对应 /みあお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-628", chars: "灭", kana: "みえ", romaji: "mie", note: "标准音节补缺：mie 对应 /みえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-629", chars: "谬", kana: "みゅう", romaji: "miu", note: "标准音节补缺：miu 对应 /みゅう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-630", chars: "某,谋", kana: "もう", romaji: "mou", note: "标准音节补缺：mou 对应 /もう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-631", chars: "囊", kana: "なん", romaji: "nang", note: "标准音节补缺：nang 对应 /なん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-632", chars: "呢", kana: "ね", romaji: "ne", note: "标准音节补缺：ne 对应 /ね/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-633", chars: "嫩", kana: "ねん", romaji: "nen", note: "标准音节补缺：nen 对应 /ねん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-634", chars: "娘", kana: "にあん", romaji: "niang", note: "标准音节补缺：niang 对应 /にあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-635", chars: "捏,聂,孽", kana: "にえ", romaji: "nie", note: "标准音节补缺：nie 对应 /にえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-636", chars: "宁,凝,拧", kana: "にん", romaji: "ning", note: "标准音节补缺：ning 对应 /にん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-637", chars: "牛,扭,纽", kana: "にゅう", romaji: "niu", note: "标准音节补缺：niu 对应 /にゅう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-638", chars: "暖", kana: "ぬあん", romaji: "nuan", note: "标准音节补缺：nuan 对应 /ぬあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-639", chars: "诺,挪,懦", kana: "ぬお", romaji: "nuo", note: "标准音节补缺：nuo 对应 /ぬお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-640", chars: "虐,疟", kana: "にゅえ", romaji: "nüe", note: "标准音节补缺：nüe 对应 /にゅえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-641", chars: "欧,偶,藕,呕", kana: "おう", romaji: "ou", note: "标准音节补缺：ou 对应 /おう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-642", chars: "拍,排,牌,派", kana: "ぱい", romaji: "pai", note: "标准音节补缺：pai 对应 /ぱい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-643", chars: "盘,判,盼,攀", kana: "ぱん", romaji: "pan", note: "标准音节补缺：pan 对应 /ぱん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-644", chars: "配,陪,培,赔", kana: "ぺい", romaji: "pei", note: "标准音节补缺：pei 对应 /ぺい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-645", chars: "喷,盆", kana: "ぺん", romaji: "pen", note: "标准音节补缺：pen 对应 /ぺん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-646", chars: "批,皮,披,匹", kana: "ぴ", romaji: "pi", note: "标准音节补缺：pi 对应 /ぴ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-647", chars: "瞥", kana: "ぴえ", romaji: "pie", note: "标准音节补缺：pie 对应 /ぴえ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-648", chars: "坡,破,婆,迫", kana: "ぽ", romaji: "po", note: "标准音节补缺：po 对应 /ぽ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-649", chars: "剖", kana: "ぽう", romaji: "pou", note: "标准音节补缺：pou 对应 /ぽう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-650", chars: "普,谱,铺,葡", kana: "ぷ", romaji: "pu", note: "标准音节补缺：pu 对应 /ぷ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-651", chars: "恰,洽", kana: "ちあ", romaji: "qia", note: "标准音节补缺：qia 对应 /ちあ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-652", chars: "亲,琴,勤,秦", kana: "ちん", romaji: "qin", note: "标准音节补缺：qin 对应 /ちん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-653", chars: "穷,琼", kana: "ちょん", romaji: "qiong", note: "标准音节补缺：qiong 对应 /ちょん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-654", chars: "群,裙", kana: "ちゅん", romaji: "qun", note: "标准音节补缺：qun 对应 /ちゅん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-655", chars: "绕,扰", kana: "らお", romaji: "rao", note: "标准音节补缺：rao 对应 /らお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-656", chars: "仍,扔", kana: "れん", romaji: "reng", note: "标准音节补缺：reng 对应 /れん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-657", chars: "瑞,锐", kana: "るい", romaji: "rui", note: "标准音节补缺：rui 对应 /るい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-658", chars: "润", kana: "るん", romaji: "run", note: "标准音节补缺：run 对应 /るん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-659", chars: "若,弱", kana: "るお", romaji: "ruo", note: "标准音节补缺：ruo 对应 /るお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-660", chars: "洒,撒", kana: "さ", romaji: "sa", note: "标准音节补缺：sa 对应 /さ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-661", chars: "赛,塞", kana: "さい", romaji: "sai", note: "标准音节补缺：sai 对应 /さい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-662", chars: "桑,丧,嗓", kana: "さん", romaji: "sang", note: "标准音节补缺：sang 对应 /さん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-663", chars: "扫,嫂,骚", kana: "さお", romaji: "sao", note: "标准音节补缺：sao 对应 /さお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-664", chars: "森", kana: "せん", romaji: "sen", note: "标准音节补缺：sen 对应 /せん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-665", chars: "沙,杀,傻,纱", kana: "しゃ", romaji: "sha", note: "标准音节补缺：sha 对应 /しゃ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-666", chars: "晒", kana: "しゃい", romaji: "shai", note: "标准音节补缺：shai 对应 /しゃい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-667", chars: "", kana: "しぇい", romaji: "shei", note: "标准音节补缺：shei 对应 /しぇい/；“谁”的默认输出仍使用 shui。", source: "generated", soundStatus: "new" },
  { id: "default-668", chars: "刷", kana: "しゅあ", romaji: "shua", note: "标准音节补缺：shua 对应 /しゅあ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-669", chars: "帅,摔,衰", kana: "しゅあい", romaji: "shuai", note: "标准音节补缺：shuai 对应 /しゅあい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-670", chars: "栓", kana: "しゅあん", romaji: "shuan", note: "标准音节补缺：shuan 对应 /しゅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-671", chars: "双,爽,霜", kana: "しゅあん", romaji: "shuang", note: "标准音节补缺：shuang 对应 /しゅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-672", chars: "顺,瞬", kana: "しゅん", romaji: "shun", note: "标准音节补缺：shun 对应 /しゅん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-673", chars: "搜,艘", kana: "そう", romaji: "sou", note: "标准音节补缺：sou 对应 /そう/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-674", chars: "孙,损", kana: "すん", romaji: "sun", note: "标准音节补缺：sun 对应 /すん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-675", chars: "谈,探,叹,坦", kana: "たん", romaji: "tan", note: "标准音节补缺：tan 对应 /たん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-676", chars: "桃,逃,陶,讨,套", kana: "たお", romaji: "tao", note: "标准音节补缺：tao 对应 /たお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-677", chars: "疼,腾,藤", kana: "てん", romaji: "teng", note: "标准音节补缺：teng 对应 /てん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-678", chars: "团", kana: "とぅあん", romaji: "tuan", note: "标准音节补缺：tuan 对应 /とぅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-679", chars: "推,腿,退", kana: "とぅい", romaji: "tui", note: "标准音节补缺：tui 对应 /とぅい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-680", chars: "吞,屯", kana: "とぅん", romaji: "tun", note: "标准音节补缺：tun 对应 /とぅん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-681", chars: "脱,托,拖,妥", kana: "とぅお", romaji: "tuo", note: "标准音节补缺：tuo 对应 /とぅお/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-682", chars: "翁", kana: "うぇん", romaji: "weng", note: "标准音节补缺：weng 对应 /うぇん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-683", chars: "兄,胸,雄,熊", kana: "しょん", romaji: "xiong", note: "标准音节补缺：xiong 对应 /しょん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-684", chars: "赞,暂,咱", kana: "ざん", romaji: "zan", note: "标准音节补缺：zan 对应 /ざん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-685", chars: "脏,藏,葬", kana: "ざん", romaji: "zang", note: "标准音节补缺：zang 对应 /ざん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-686", chars: "贼", kana: "ぜい", romaji: "zei", note: "标准音节补缺：zei 对应 /ぜい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-687", chars: "炸,扎,渣,闸", kana: "じゃ", romaji: "zha", note: "标准音节补缺：zha 对应 /じゃ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-688", chars: "摘,宅,窄,债", kana: "じゃい", romaji: "zhai", note: "标准音节补缺：zhai 对应 /じゃい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-689", chars: "张,章,掌,账", kana: "じゃん", romaji: "zhang", note: "标准音节补缺：zhang 对应 /じゃん/；“长”的默认输出仍使用 chang。", source: "generated", soundStatus: "new" },
  { id: "default-690", chars: "抓", kana: "じゅあ", romaji: "zhua", note: "标准音节补缺：zhua 对应 /じゅあ/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-691", chars: "拽", kana: "じゅあい", romaji: "zhuai", note: "标准音节补缺：zhuai 对应 /じゅあい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-692", chars: "转,专,砖,赚", kana: "じゅあん", romaji: "zhuan", note: "标准音节补缺：zhuan 对应 /じゅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-693", chars: "装,庄,状,撞", kana: "じゅあん", romaji: "zhuang", note: "标准音节补缺：zhuang 对应 /じゅあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-694", chars: "追,坠,锥", kana: "じゅい", romaji: "zhui", note: "标准音节补缺：zhui 对应 /じゅい/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-695", chars: "总,宗,踪,综", kana: "ぞん", romaji: "zong", note: "标准音节补缺：zong 对应 /ぞん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-696", chars: "钻", kana: "ずあん", romaji: "zuan", note: "标准音节补缺：zuan 对应 /ずあん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-697", chars: "尊,遵", kana: "ずん", romaji: "zun", note: "标准音节补缺：zun 对应 /ずん/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-698", chars: "额,鹅", kana: "え", romaji: "e", note: "标准音节补缺：e 对应 /え/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-699", chars: "哈", kana: "は", romaji: "ha", note: "标准音节补缺：ha 对应 /は/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-700", chars: "哦", kana: "お", romaji: "o", note: "标准音节补缺：o 对应 /お/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-701", chars: "呀,压,牙", kana: "や", romaji: "ya", note: "标准音节补缺：ya 对应 /や/，请校对。", source: "generated", soundStatus: "new" },
  { id: "default-702", chars: "哟", kana: "よ", romaji: "yo", note: "标准音节补缺：yo 对应 /よ/，请校对。", source: "generated", soundStatus: "new" },
];
const ACTIVE_REVIEW_ROW_IDS = new Set(Array.from({ length: 107 }, (_, index) => `default-${index + 596}`));
const DEFAULT_PHRASE_ROWS = [
  { id: "phrase-0", phrase: "家人", kana: "かじん", romaji: "jia ren", note: "按音感拼接，家人直接按音译连写。", source: "generated" },
  { id: "phrase-1a", phrase: "同学", kana: "どうがく", romaji: "tong xue", note: "按音感拼接，保持原字音节节奏。", source: "generated" },
  { id: "phrase-1b", phrase: "学生", kana: "がくせい", romaji: "xue sheng", note: "按音感拼接，去掉语义转写。", source: "generated" },
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

let phoneticRows = mergeEditablePhoneticRows(DEFAULT_PHONETIC_ROWS.map((item) => ({ ...item })));
let phraseRows = DEFAULT_PHRASE_ROWS.map((item) => ({ ...item }));
let kanaMap = {};
let phraseKanaMap = {};
let phraseKanaEntries = [];

let makerVersion = 0;
let makerMode = "syllable";
let makerHistory = [];

function parseJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function mergeHomophoneRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.romaji.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        chars: Array.from(new Set(row.chars)),
        kana: row.kana,
        romaji: row.romaji,
        note: row.note,
        source: row.source,
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
      existing.source = row.source;
      existing.manual = true;
    }
    if (row.note && row.note !== existing.note) {
      existing.note = `${existing.note}; ${row.note}`;
    }
  }
  return Array.from(map.values());
}

function mergeEditablePhoneticRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const kana = (row.kana || "").trim();
    const romaji = (row.romaji || "").trim();
    const chars = typeof row.chars === "string"
      ? row.chars.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
      : [];
    if (!kana || !romaji) continue;
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
    const existingNote = typeof existing.note === "string" ? existing.note.trim() : "";
    const rowNote = typeof row.note === "string" ? row.note.trim() : "";
    if (rowNote && rowNote !== existingNote) {
      existing.note = existingNote ? `${existingNote}; ${rowNote}` : rowNote;
    }
  }
  return Array.from(map.values());
}

function ensurePolyphonicReadings(rows) {
  const required = [{ char: "行", romaji: "hang" }, { char: "行", romaji: "xing" }];
  required.forEach(({ char, romaji }) => {
    const row = rows.find((item) => item.romaji.trim().toLowerCase() === romaji);
    if (!row) return;
    const chars = row.chars.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
    if (!chars.includes(char)) row.chars = [...chars, char].join(",");
  });
  return rows;
}

const POLYPHONIC_CONTEXT_RULES = {
  行: [
    { romaji: "hang", words: ["银行", "行业", "行长", "行家", "行列", "行号", "行距", "同行", "一行", "两行", "三行"] },
    { romaji: "xing", words: ["行走", "行动", "行为", "执行", "进行", "可行", "不行", "行使", "旅行", "行程", "行人", "行吗"] },
  ],
};

const EXACT_ROMAJI_KANA = {
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

function pickPolyphonicKana(text, index, char) {
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
  const row = phoneticRows.find((item) => item.romaji.trim().toLowerCase() === selectedRomaji && item.chars.split(/[,，]/).map((value) => value.trim()).includes(char));
  return row ? { kana: row.kana.trim(), romaji: selectedRomaji } : null;
}

function normalizePhoneticRows(rows) {
  return mergeHomophoneRows(
    rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const chars = typeof row.chars === "string"
        ? row.chars
          .split(/[,，]/)
          .map((item) => item.trim())
          .filter(Boolean)
        : [];
      const kana = typeof row.kana === "string" ? row.kana.trim() : "";
      const romaji = typeof row.romaji === "string" ? row.romaji.trim() : "";
      if (chars.length === 0 || !kana || !romaji) return null;
      return {
        chars,
        kana,
        romaji,
        note: typeof row.note === "string" && row.note.trim() ? row.note.trim() : `${chars.join("/") } 按音感重写`,
        source: row.source === "generated" ? "generated" : row.source === "seed" ? "seed" : "custom",
        soundStatus: row.soundStatus === "new" ? "new" : "same",
        manual: row.manual === true,
      };
    })
    .filter(Boolean),
  );
}

function normalizePhraseRows(rows) {
  const map = {};
  (rows || [])
    .filter((row) => row && typeof row === "object")
    .forEach((row) => {
      const phrase = typeof row.phrase === "string" ? row.phrase.trim() : "";
      const kana = typeof row.kana === "string" ? row.kana.trim() : "";
      const romaji = typeof row.romaji === "string" ? row.romaji.trim() : "";
      if (!phrase || !kana || !romaji) return;
      map[phrase] = {
        kana,
        romaji,
        note: typeof row.note === "string" && row.note.trim() ? row.note.trim() : `${phrase} 的连写映射`,
      };
    });
  return map;
}

function makeKanaMapFromGroups(rows) {
  return rows
    .flatMap((group) => group.chars.map((char) => [char, { kana: group.kana, romaji: group.romaji, note: group.note }]))
    .reduce((acc, [char, group]) => {
      acc[char] = group;
      return acc;
    }, {});
}

function withGeneratedDefaults(rows, defaults) {
  const ids = new Set(rows.map((row) => row.id));
  const merged = rows.slice();
  defaults.forEach((row) => {
    if (!ids.has(row.id)) {
      merged.push(row);
    }
  });
  return merged;
}

function normalizeMappings() {
  const normalizedPhonetic = normalizePhoneticRows(phoneticRows);
  const normalizedPhrase = normalizePhraseRows(phraseRows);
  kanaMap = makeKanaMapFromGroups(normalizedPhonetic);
  phraseKanaMap = normalizedPhrase;
  phraseKanaEntries = Object.keys(phraseKanaMap).sort((a, b) => b.length - a.length);
}

function saveMappings() {
  try {
    localStorage.setItem(MAKER_PHONETIC_ROWS_KEY, JSON.stringify(phoneticRows));
    localStorage.setItem(MAKER_PHRASE_ROWS_KEY, JSON.stringify(phraseRows));
  } catch {}
  if (isAdminEditor && remoteMappingsReady) {
    window.clearTimeout(remoteSaveTimer);
    remoteSaveTimer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/mappings", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneticRows }),
        });
        if (!response.ok) throw new Error("save failed");
      } catch {
        window.alert("规则已保存到本机，但未能同步到线上，请确认管理员仍处于登录状态。");
      }
    }, 500);
  }
}

const isAdminEditor = location.pathname.startsWith("/admin/editor");
let remoteMappingsReady = false;
let remoteSaveTimer = 0;

async function loadRemoteMappings() {
  try {
    const response = await fetch("/api/mappings", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.phoneticRows) && data.phoneticRows.length) {
      phoneticRows = mergeEditablePhoneticRows(ensurePolyphonicReadings(withGeneratedDefaults(data.phoneticRows, DEFAULT_PHONETIC_ROWS)));
      normalizeMappings();
      try { localStorage.setItem(MAKER_PHONETIC_ROWS_KEY, JSON.stringify(phoneticRows)); } catch {}
      renderMappingEditors();
    }
  } catch {}
  finally { remoteMappingsReady = true; }
}

function loadMappings() {
  try {
    const parsedPhonetic = parseJsonArray(localStorage.getItem(MAKER_PHONETIC_ROWS_KEY))
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        return {
          id: typeof row.id === "string" ? row.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          chars: typeof row.chars === "string" ? row.chars : "",
          kana: typeof row.kana === "string" ? row.kana : "",
          romaji: typeof row.romaji === "string" ? row.romaji : "",
          note: typeof row.note === "string" ? row.note : "",
          source: row.source === "generated" ? "generated" : row.source === "seed" ? "seed" : "custom",
          soundStatus: row.soundStatus === "new" ? "new" : "same",
          manual: row.manual === true,
        };
      })
      .filter(Boolean);
    const parsedPhrase = parseJsonArray(localStorage.getItem(MAKER_PHRASE_ROWS_KEY))
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        return {
          id: typeof row.id === "string" ? row.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          phrase: typeof row.phrase === "string" ? row.phrase : "",
          kana: typeof row.kana === "string" ? row.kana : "",
          romaji: typeof row.romaji === "string" ? row.romaji : "",
          note: typeof row.note === "string" ? row.note : "",
          source: row.source === "generated" ? "generated" : row.source === "seed" ? "seed" : "custom",
        };
      })
      .filter(Boolean);

    parsedPhonetic.forEach((row) => {
      const baseline = DEFAULT_PHONETIC_ROWS.find((item) => item.id === row.id);
      const normalizeChars = (value) => String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean).sort().join(",");
      if (!baseline || row.manual === true || row.kana !== baseline.kana || row.romaji !== baseline.romaji || normalizeChars(row.chars) !== normalizeChars(baseline.chars)) {
        row.manual = true;
        row.source = "custom";
      }
    });

    if (localStorage.getItem(MING_MAPPING_CORRECTION_KEY) !== "done") {
      parsedPhonetic.forEach((row) => {
        if (row.romaji.trim().toLowerCase() === "ming") {
          row.kana = "みん";
          row.note = "按用户校对：ming 统一映射为 /みん/。";
          row.manual = true;
        }
      });
      localStorage.setItem(MING_MAPPING_CORRECTION_KEY, "done");
    }
    if (localStorage.getItem(JIA_MAPPING_CORRECTION_KEY) !== "done") {
      parsedPhonetic.forEach((row) => {
        if (row.romaji.trim().toLowerCase() === "jia") {
          row.kana = "じあ";
          row.note = "按用户校对：jia 统一映射为 /じあ/。";
          row.manual = true;
        }
      });
      localStorage.setItem(JIA_MAPPING_CORRECTION_KEY, "done");
    }

    if (localStorage.getItem(MAKER_MAPPING_CORRECTION_KEY) !== "done") {
      const correctedIds = new Set(["default-02", "default-18", "default-20", "default-26", "default-28", "default-35", "default-48", "default-63", "default-80", "default-108", "default-109", "default-110", "default-116", "default-119", "default-136", "default-142", "default-200"]);
      correctedIds.forEach((id) => {
        const corrected = DEFAULT_PHONETIC_ROWS.find((row) => row.id === id);
        if (!corrected) return;
        const index = parsedPhonetic.findIndex((row) => row.id === id);
        if (index >= 0 && parsedPhonetic[index].manual !== true) parsedPhonetic[index] = { ...corrected };
      });
      localStorage.setItem(MAKER_MAPPING_CORRECTION_KEY, "done");
    }

  if (parsedPhonetic.length > 0) {
      phoneticRows = mergeEditablePhoneticRows(ensurePolyphonicReadings(withGeneratedDefaults(parsedPhonetic, DEFAULT_PHONETIC_ROWS)));
    }
    if (parsedPhrase.length > 0) {
      phraseRows = withGeneratedDefaults(parsedPhrase, DEFAULT_PHRASE_ROWS);
    }
  } catch {}

  normalizeMappings();
  saveMappings();
  renderMappingEditors();
}

const fallbackBank = [
  { kana: "あ", romaji: "a" },
  { kana: "い", romaji: "i" },
  { kana: "う", romaji: "u" },
  { kana: "え", romaji: "e" },
  { kana: "お", romaji: "o" },
  { kana: "か", romaji: "ka" },
  { kana: "き", romaji: "ki" },
  { kana: "きゃ", romaji: "kya" },
  { kana: "し", romaji: "shi" },
  { kana: "す", romaji: "su" },
  { kana: "すい", romaji: "sui" },
  { kana: "つ", romaji: "tsu" },
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
  { kana: "み", romaji: "mi" },
  { kana: "り", romaji: "ri" },
  { kana: "る", romaji: "ru" },
  { kana: "れ", romaji: "re" },
  { kana: "ら", romaji: "ra" },
  { kana: "わ", romaji: "wa" },
  { kana: "ん", romaji: "n" },
];

const fallbackBuckets = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25],
  [26, 27, 28],
];

const moraTemplate = {
  onset: [6, 7, 8, 9, 12, 13, 15, 16, 17, 19], // き/きゃ/さ/し/た/て/な/に/ひ/と
  nucleus: [0, 1, 2, 3, 4, 5, 11, 14], // a/i/u/e/o/ka/sui/to
  coda: [17, 18, 20, 21, 22, 23, 24, 25, 28], // hi/fu/… + 尾音区
};

function pickTemplateUnit(options, seed, offset) {
  const index = Math.abs((seed + offset) % options.length);
  return fallbackBank[options[index]];
}

function pickExplicitKanaForPhrase(text, startIndex) {
  const tail = text.slice(startIndex);
  for (let i = 0; i < phraseKanaEntries.length; i += 1) {
    const phrase = phraseKanaEntries[i];
    if (tail.startsWith(phrase)) {
      return { ...phraseKanaMap[phrase], length: phrase.length };
    }
  }
  return null;
}

const MAKER_MODE_KEY = "otowai-maker-mode";
const MAKER_HISTORY_KEY = "otowai-maker-history";
const MAKER_VOICE_KEY = "otowai-maker-japanese-voice";
const MAKER_HISTORY_LIMIT = 20;

let category = "全部";
let daily = 0;
const entriesEl = document.querySelector("#entries");

function isKana(text) {
  return /[\u3040-\u30ff]/.test(text);
}

function isHan(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function estimateSpeechUnits(text) {
  if (!text) return 1;
  let units = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
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

function alignSpeechRate(referenceText, targetKana) {
  const baseRate = 0.9;
  const referenceUnits = estimateSpeechUnits(referenceText || "");
  const targetUnits = estimateSpeechUnits((targetKana || "").replace(/\s+/g, ""));
  return clampNumber(baseRate * (targetUnits / referenceUnits), 0.35, 3.5);
}

function pickFallbackMora(char, variant = 0, index = 0) {
  const code = char.charCodeAt(0);
  const seed = (code * 97 + variant * 131 + index * 31) >>> 0;
  if (isHan(char)) {
    const bucket = fallbackBuckets[seed % fallbackBuckets.length];
    return fallbackBank[bucket[(seed >> 3) % bucket.length]];
  }
  return fallbackBank[seed % fallbackBank.length];
}

function pickFallbackMoraCluster(char, variant = 0, index = 0) {
  if (!isHan(char)) {
    const fallback = pickFallbackMora(char, variant, index);
    return [{ kana: fallback.kana, romaji: fallback.romaji }];
  }

  const code = char.charCodeAt(0);
  const seed = (code * 97 + variant * 131 + index * 31) >>> 0;
  const cluster = [];
  const templateType = (seed % 3); // 0:CV, 1:CVC, 2:CVN
  cluster.push(pickTemplateUnit(moraTemplate.onset, seed >>> 1, 0));
  cluster.push(pickTemplateUnit(moraTemplate.nucleus, seed >>> 2, 3));
  if (templateType > 0) {
    cluster.push(pickTemplateUnit(moraTemplate.coda, seed >>> 3, 5));
  }
  return cluster;
}

function loadMakerHistory() {
  try {
    const raw = localStorage.getItem(MAKER_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (
          !item ||
          typeof item.input !== "string" ||
          typeof item.kana !== "string" ||
          typeof item.romaji !== "string" ||
          typeof item.note !== "string" ||
          (item.mode !== undefined && item.mode !== "syllable" && item.mode !== "semantic") ||
          typeof item.confidence !== "number" ||
          typeof item.id !== "string"
        ) {
          return null;
        }
        return {
          ...item,
          mode: "syllable",
          id: item.id,
          createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  } catch {
    return [];
  }
}

function saveMakerHistory(history) {
  try {
    localStorage.setItem(MAKER_HISTORY_KEY, JSON.stringify(history.slice(0, MAKER_HISTORY_LIMIT)));
  } catch {}
  return history.slice(0, MAKER_HISTORY_LIMIT);
}

function getJapaneseVoices() {
  if (!("speechSynthesis" in window)) return null;
  const femaleNames = /kyoko|nanami|haruka|o-ren|female|女性|女声/i;
  return speechSynthesis.getVoices()
    .filter((item) => /^ja(?:-|_)/i.test(item.lang))
    .sort((a, b) => Number(femaleNames.test(b.name)) - Number(femaleNames.test(a.name)));
}

function getJapaneseVoice(preferredVoiceURI = "") {
  const voices = getJapaneseVoices() || [];
  let savedVoiceURI = preferredVoiceURI;
  if (!savedVoiceURI) {
    try { savedVoiceURI = localStorage.getItem(MAKER_VOICE_KEY) || ""; } catch {}
  }
  return voices.find((item) => item.voiceURI === savedVoiceURI) || voices[0] || null;
}

const speechTimingCache = new Map();

function getVoiceForLanguage(language, preferredVoiceURI = "") {
  if (!("speechSynthesis" in window)) return null;
  if (/^ja(?:-|_)/i.test(language)) return getJapaneseVoice(preferredVoiceURI);
  const languagePrefix = language.split(/[-_]/)[0];
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith(languagePrefix.toLowerCase()));
  return voices.find((voice) => voice.voiceURI === preferredVoiceURI)
    || voices.find((voice) => /^zh(?:-|_)CN/i.test(voice.lang))
    || voices[0]
    || null;
}

function estimateSpeechSeconds(text, language = "zh-CN") {
  const unitsPerSecond = /^ja(?:-|_)/i.test(language) ? 4.7 : 4.1;
  return Math.max(0.45, estimateSpeechUnits(text) / unitsPerSecond);
}

function measureSpeechDuration(text, language, preferredVoiceURI = "") {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window) || !text.trim()) {
      reject(new Error("speech synthesis unavailable"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.volume = 0;
    const selectedVoice = getVoiceForLanguage(language, preferredVoiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;

    let startedAt = 0;
    let settled = false;
    let timeoutId = 0;
    const finish = (duration, error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (error) reject(error);
      else resolve(Math.max(0.1, duration));
    };

    utterance.onstart = () => { startedAt = performance.now(); };
    utterance.onend = () => {
      const elapsed = startedAt ? (performance.now() - startedAt) / 1000 : estimateSpeechSeconds(text, language);
      finish(elapsed);
    };
    utterance.onerror = () => finish(0, new Error("speech measurement failed"));

    const timeoutMs = clampNumber(estimateSpeechSeconds(text, language) * 3200 + 5000, 8000, 36000);
    timeoutId = window.setTimeout(() => {
      speechSynthesis.cancel();
      finish(0, new Error("speech measurement timed out"));
    }, timeoutMs);

    speechSynthesis.cancel();
    window.setTimeout(() => {
      if (settled) return;
      speechSynthesis.speak(utterance);
      speechSynthesis.resume();
    }, 90);
  });
}

async function calibrateSpeechTiming(referenceText, targetKana, preferredVoiceURI = "") {
  const cacheKey = [referenceText, targetKana, preferredVoiceURI].join("\u0001");
  if (speechTimingCache.has(cacheKey)) return speechTimingCache.get(cacheKey);

  const fallbackReferenceSeconds = estimateSpeechSeconds(referenceText, "zh-CN");
  const fallbackTargetSeconds = estimateSpeechSeconds(targetKana, "ja-JP");
  let timing;
  try {
    const referenceSeconds = await measureSpeechDuration(referenceText, "zh-CN");
    const targetSeconds = await measureSpeechDuration(targetKana, "ja-JP", preferredVoiceURI);
    timing = {
      referenceSeconds,
      targetSeconds,
      matchedRate: clampNumber(targetSeconds / referenceSeconds, 0.35, 3.5),
      measured: true,
    };
  } catch {
    timing = {
      referenceSeconds: fallbackReferenceSeconds,
      targetSeconds: fallbackTargetSeconds,
      matchedRate: alignSpeechRate(referenceText, targetKana),
      measured: false,
    };
  }
  speechTimingCache.set(cacheKey, timing);
  return timing;
}

function playSpeech(text, rate, handlers = {}) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    handlers.onerror?.();
    window.alert("当前浏览器不支持系统朗读，请尝试用手机系统浏览器打开。");
    return;
  }
  speechSynthesis.cancel();
  window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;
    const japaneseVoice = getJapaneseVoice(handlers.voiceURI);
    if (japaneseVoice) utterance.voice = japaneseVoice;
    utterance.onstart = handlers.onstart || null;
    utterance.onend = handlers.onend || null;
    utterance.onerror = () => {
      handlers.onerror?.();
      window.alert("未能调用日语语音。请关闭手机静音模式，或改用 Safari / Chrome 打开。");
    };
    speechSynthesis.speak(utterance);
    speechSynthesis.resume();
  }, 120);
}

function speak(kana, button, referenceText) {
  const baseRate = typeof referenceText === "string"
    ? alignSpeechRate(referenceText, kana)
    : 0.72;
  const rate = clampNumber(baseRate, 0.45, 2);
  playSpeech(kana, rate, {
    onstart: () => { button.innerHTML = "<span>◼</span> 正在聆听"; },
    onend: () => { button.innerHTML = "<span>▶</span> 听听声音"; },
    onerror: () => { button.innerHTML = "<span>▶</span> 听听声音"; },
  });
}

function formatHistoryTime(createdAt) {
  try {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function bindSpeakers() {
  document.querySelectorAll(".speak").forEach(button => {
    button.onclick = () => speak(button.dataset.kana, button);
  });
}

function render() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const filtered = entries.filter(entry =>
    (category === "全部" || entry.category === category) &&
    (!query || `${entry.chinese} ${entry.kana} ${entry.romaji} ${entry.source}`.toLowerCase().includes(query))
  );
  entriesEl.innerHTML = filtered.length ? filtered.map((entry, index) => `
    <article class="entry-card">
      <div class="entry-top"><span>${String(index + 1).padStart(2,"0")}</span><em>${entry.category}</em></div>
      <h3>${entry.chinese}</h3><div class="mini-wave" aria-hidden="true"><i></i><b>〜</b><i></i></div>
      <p class="entry-kana">${entry.kana}</p><p class="romaji">${entry.romaji}</p>
      <p class="entry-note">${entry.note}</p>
      <footer><span>${entry.source}</span><button class="sound-button speak" data-kana="${entry.kana}"><span>▶</span> 听听声音</button></footer>
    </article>`).join("") : `
    <div class="empty-state"><span>声</span><h3>暂时没有听见相近的回声</h3><p>换个关键词，或者把你的发现分享给我们。</p></div>`;
  bindSpeakers();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function renderMappingEditors() {
  const phoneticBody = document.querySelector("#phonetic-mapping-rows");
  const phraseBody = document.querySelector("#phrase-mapping-rows");
  if (!phoneticBody) return;

  const searchInput = document.querySelector("#maker-mapping-search");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const matches = (row, fields) => !query || fields.some((field) => String(row[field] || "").toLowerCase().includes(query));
  const visiblePhoneticRows = phoneticRows.filter((row) => matches(row, ["chars", "kana", "romaji", "note"]));
  const visiblePhraseRows = phraseRows.filter((row) => matches(row, ["phrase", "kana", "romaji", "note"]));

  phoneticBody.innerHTML = visiblePhoneticRows
    .map(
      (row) => `
        <tr class="${ACTIVE_REVIEW_ROW_IDS.has(row.id) || row.id.startsWith("generated-") ? "mapping-row-new-sound" : ""}" data-row-id="${escapeHtml(row.id)}" data-row-type="phonetic">
          <td><input value="${escapeHtml(row.romaji || "")}" data-field="romaji" aria-label="拼音"></td>
          <td><input value="${escapeHtml(row.kana || "")}" data-field="kana"></td>
          <td><button type="button" class="mapping-speak speak" data-kana="${escapeHtml(row.kana || "")}" aria-label="朗读 ${escapeHtml(row.kana || "")}">🔊</button></td>
          <td><button type="button" data-action="remove-row">删</button></td>
        </tr>
      `
    )
    .join("");

  if (phraseBody) phraseBody.innerHTML = visiblePhraseRows
    .map(
      (row) => `
        <tr class="${row.source === "generated" ? "mapping-row-generated" : ""}" data-row-id="${escapeHtml(row.id)}" data-row-type="phrase">
          <td><input value="${escapeHtml(row.phrase || "")}" data-field="phrase"></td>
          <td><input value="${escapeHtml(row.kana || "")}" data-field="kana"></td>
          <td><input value="${escapeHtml(row.romaji || "")}" data-field="romaji"></td>
          <td><input value="${escapeHtml(row.note || "")}" data-field="note"></td>
          <td><button type="button" data-action="remove-row">删</button></td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll("[data-action='remove-row']").forEach((button) => {
    button.onclick = (event) => {
      const rowEl = event.currentTarget.closest("tr");
      if (!rowEl) return;
      const rowId = rowEl.getAttribute("data-row-id") || "";
      const rowType = rowEl.getAttribute("data-row-type") || "phonetic";
      if (rowType === "phrase") {
        phraseRows = phraseRows.filter((row) => row.id !== rowId);
      } else {
        phoneticRows = phoneticRows.filter((row) => row.id !== rowId);
      }
      normalizeMappings();
      saveMappings();
      renderMappingEditors();
    };
  });
  bindSpeakers();
}

function bindMappingEditors() {
  const config = document.querySelector("#maker-config");
  if (!config) return;

  const phoneticBody = document.querySelector("#phonetic-mapping-rows");
  const phraseBody = document.querySelector("#phrase-mapping-rows");
  const mappingSearch = document.querySelector("#maker-mapping-search");
  if (mappingSearch) {
    mappingSearch.addEventListener("input", renderMappingEditors);
  }

  const applyEdit = (rowType, rowId, field, value) => {
    if (rowType === "phrase") {
      phraseRows = phraseRows.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value };
      });
    } else {
      phoneticRows = phoneticRows.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value, source: "custom", manual: true };
      });
    }
    normalizeMappings();
    saveMappings();
  };

  [phoneticBody, phraseBody].filter(Boolean).forEach((tbody) => {
    if (!tbody) return;
    tbody.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const rowEl = target.closest("tr[data-row-id]");
      const rowId = rowEl ? rowEl.getAttribute("data-row-id") : "";
      const rowType = rowEl ? rowEl.getAttribute("data-row-type") : "phonetic";
      const field = target.getAttribute("data-field");
      if (!rowId || !field) return;
      applyEdit(rowType, rowId, field, target.value);
    });
  });

  const addPhonetic = document.querySelector("#add-phonetic-row");
  const addPhrase = document.querySelector("#add-phrase-row");
  const resetButton = document.querySelector("#maker-reset-mappings");
  if (addPhonetic) {
    addPhonetic.onclick = () => {
      const rowId = `phonetic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      phoneticRows = [{
        id: rowId,
        chars: "",
        kana: "",
        romaji: "",
        note: "",
        source: "custom",
        manual: true,
      }, ...phoneticRows];
      if (mappingSearch) mappingSearch.value = "";
      normalizeMappings();
      saveMappings();
      renderMappingEditors();
      const input = document.querySelector(`tr[data-row-id="${rowId}"] input[data-field="romaji"]`);
      if (input) {
        input.scrollIntoView({ block: "center", behavior: "smooth" });
        input.focus();
      }
    };
  }
  if (addPhrase) {
    addPhrase.onclick = () => {
      phraseRows = [...phraseRows, {
        id: `phrase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        phrase: "",
        kana: "",
        romaji: "",
        note: "",
        source: "custom",
      }];
      normalizeMappings();
      saveMappings();
      renderMappingEditors();
    };
  }
  if (resetButton) {
    resetButton.onclick = () => {
      phoneticRows = mergeEditablePhoneticRows(
        DEFAULT_PHONETIC_ROWS.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` })),
      );
      phraseRows = DEFAULT_PHRASE_ROWS.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` }));
      normalizeMappings();
      saveMappings();
      renderMappingEditors();
    };
  }
}

async function bindAdminMappingView() {
  const config = document.querySelector("#maker-config");
  const toggle = document.querySelector("#maker-admin-toggle");
  if (!config || !toggle) return;
  let enabled = isAdminEditor;
  try {
    if (!enabled) {
      const response = await fetch("/api/admin-session", { credentials: "same-origin", cache: "no-store" });
      enabled = response.ok && (await response.json()).isOwner === true;
    }
  } catch {}
  if (!enabled) {
    toggle.hidden = true;
    config.hidden = true;
    return;
  }
  toggle.hidden = false;
  toggle.onclick = () => {
    const open = !config.hidden;
    config.hidden = open;
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.textContent = open ? "管理映射" : "收起映射";
  };
}

function buildMakerSentence(input, variant = 0, mode = "syllable") {
  const original = input.trim();
  const compact = original.replace(/\s+/g, "");
  const chars = [...compact];
  const usePhraseMatch = false;

  let kana = [];
  let romaji = [];
  const matchedChars = [];
  const generatedChars = [];
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const isHanChar = /[\u4e00-\u9fff]/.test(char);
    let item = null;
    const phraseMatch = usePhraseMatch && isHanChar ? pickExplicitKanaForPhrase(compact, i) : null;
    const polyphonicMatch = isHanChar ? pickPolyphonicKana(compact, i, char) : null;

    if (phraseMatch) {
      item = { kana: phraseMatch.kana, romaji: phraseMatch.romaji };
      i += phraseMatch.length - 1;
    } else if (isKana(char)) {
      item = { kana: char, romaji: char };
    } else if (polyphonicMatch) {
      item = polyphonicMatch;
      matchedChars.push({ char, kana: item.kana });
    } else if (isHanChar && kanaMap[char]) {
      item = { ...kanaMap[char] };
      matchedChars.push({ char, kana: item.kana });
    } else if (isHanChar && window.OTOWAI_PINYIN_BY_CHAR?.[char]) {
      const pinyin = window.OTOWAI_PINYIN_BY_CHAR[char];
      const samePinyinRow = phoneticRows.find((row) => row.romaji.trim().toLowerCase() === pinyin);
      const exactKana = EXACT_ROMAJI_KANA[pinyin];
      const selectedKana = samePinyinRow?.manual === true ? samePinyinRow.kana.trim() : exactKana || samePinyinRow?.kana.trim();
      if (selectedKana) {
        item = { kana: selectedKana, romaji: pinyin };
        generatedChars.push({ char, kana: item.kana, romaji: pinyin, confirmed: true });
      }
    } else if (/[a-zA-Z]/.test(char)) {
      item = { kana: char.toLowerCase(), romaji: char.toLowerCase() };
    } else if (/[0-9]/.test(char)) {
      item = { kana: char, romaji: char };
    } else if (/[。,.!?,!?，。？！]/.test(char)) {
      item = { kana: char, romaji: char };
    }

    if (!item) {
      const cluster = pickFallbackMoraCluster(char, variant, i);
      if (isHanChar) {
        const pinyin = window.OTOWAI_PINYIN_BY_CHAR?.[char];
        generatedChars.push({ char, kana: cluster.map((unit) => unit.kana).join(" "), romaji: pinyin || cluster.map((unit) => unit.romaji).join(" "), confirmed: false });
      }
      for (let j = 0; j < cluster.length; j += 1) {
        kana.push(cluster[j].kana);
        romaji.push(cluster[j].romaji);
      }
      continue;
    }

    kana.push(item.kana);
    romaji.push(item.romaji);
  }

  const matchedNote = matchedChars.length
    ? ` 已套用字库同音：${matchedChars.map((item) => `${item.char}→${item.kana}`).join("、")}，并已记录到本地历史。`
    : " 本句没有命中字库中的现有汉字映射。";
  const note = `学习版规则：按字符逐一按音感重写。中文字符优先走固定音感映射，未命中的字再走音节簇回退。` +
    " 当前为纯音节模式，不做意译式短语替换。 " +
    (isKana(original) && !isHan(original)
      ? "原有假名会尽量保留。"
      : "中文/日文混合句子时，每一段字符都参与重写。") + matchedNote;
  const confidence = chars.length > 0 ? 100 : 0;

  return { input: original, kana: kana.join(" "), romaji: romaji.join(" "), confidence, note, mode, matchedChars, generatedChars };
}

function recordGeneratedMappings(result) {
  if (!Array.isArray(result.generatedChars) || result.generatedChars.length === 0) return { added: 0, pending: 0 };
  let changed = false;
  let added = 0;
  let pending = 0;
  result.generatedChars.forEach(({ char, kana, romaji }) => {
    if (!char || kanaMap[char]) return;
    const normalizedRomaji = romaji.trim().toLowerCase();
    const sameRomajiRow = phoneticRows.find((row) => row.romaji.trim().toLowerCase() === normalizedRomaji);
    if (sameRomajiRow && sameRomajiRow.manual !== true && EXACT_ROMAJI_KANA[normalizedRomaji] === kana) {
      sameRomajiRow.kana = kana;
    }
    const existing = phoneticRows.find((row) => row.kana.trim() === kana && row.romaji.trim().toLowerCase() === normalizedRomaji);
    if (existing) {
      const chars = existing.chars.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
      if (!chars.includes(char)) { existing.chars = [...chars, char].join(","); changed = true; added += 1; }
    } else {
      phoneticRows.push({ id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, chars: char, kana, romaji, note: "由空耳制造器自动记录，请校对后保留。", source: "generated", soundStatus: "new" });
      changed = true;
      added += 1;
      pending += 1;
    }
  });
  if (changed) { normalizeMappings(); saveMappings(); renderMappingEditors(); }
  return { added, pending };
}

function auditMappingAnomalies() {
  const charOwners = new Map();
  const pinyinOwners = new Map();
  let charConflicts = 0;
  let pinyinConflicts = 0;
  phoneticRows.forEach((row) => {
    const chars = row.chars.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
    chars.forEach((char) => {
      const current = { kana: row.kana, romaji: row.romaji.trim().toLowerCase() };
      const previous = charOwners.get(char);
      const allowedReadings = char === "行" ? new Set(["xing", "hang"]) : null;
      if (previous && previous.kana !== current.kana && !(allowedReadings?.has(previous.romaji) && allowedReadings.has(current.romaji))) charConflicts += 1;
      else if (!previous) charOwners.set(char, current);
    });
    const pinyin = row.romaji.trim().toLowerCase();
    const previousKana = pinyinOwners.get(pinyin);
    if (previousKana && previousKana !== row.kana) pinyinConflicts += 1;
    else pinyinOwners.set(pinyin, row.kana);
  });
  return { charConflicts, pinyinConflicts };
}

function renderMaker(result) {
  const output = document.querySelector("#maker-output");
  output.innerHTML = `
    <div>
      <span>原句</span>
      <p>${result.input}</p>
    </div>
    <div>
      <span>对应句（假名化）</span>
      <p>${result.kana}</p>
    </div>
    <div>
      <span>对应句（发音）</span>
      <p>${result.romaji}</p>
    </div>
    <p class="maker-meta">学习匹配率：${result.confidence}% · ${result.note}</p>
    <div class="maker-playback-control">
      <label for="maker-playback-rate">匹配后微调：<span id="maker-playback-rate-value">1.0x</span></label>
      <input id="maker-playback-rate" type="range" min="0.5" max="1.8" step="0.1" value="1">
      <label for="maker-voice">朗读声音</label>
      <select id="maker-voice"><option value="">正在载入日语女声…</option></select>
      <p id="maker-timing-status" class="maker-timing-status" aria-live="polite">首次朗读时会静音测量中文原句与假名的时长。</p>
    </div>
    <div class="maker-output-actions">
      <button id="maker-copy">复制结果</button>
      <button id="maker-speak">朗读生成句子</button>
      <button id="maker-save-audio">保存音频</button>
      <button id="maker-share-audio">分享朗读</button>
      <button id="maker-restart">再生成一次</button>
    </div>
  `;

  const playbackSlider = document.querySelector("#maker-playback-rate");
  const playbackValue = document.querySelector("#maker-playback-rate-value");
  const voiceSelect = document.querySelector("#maker-voice");
  const timingStatus = document.querySelector("#maker-timing-status");
  let currentTiming = null;
  const updateTimingStatus = () => {
    if (!currentTiming) return;
    const adjustedRate = clampNumber(currentTiming.matchedRate * Number(playbackSlider.value), 0.25, 4);
    const expectedSeconds = currentTiming.targetSeconds / adjustedRate;
    timingStatus.textContent = `${currentTiming.measured ? "实测" : "估算"}中文 ${currentTiming.referenceSeconds.toFixed(1)} 秒 · 自动语速 ${currentTiming.matchedRate.toFixed(2)}x · 当前预计 ${expectedSeconds.toFixed(1)} 秒`;
  };
  playbackSlider.oninput = () => {
    playbackValue.textContent = `${Number(playbackSlider.value).toFixed(1)}x`;
    updateTimingStatus();
  };
  const refreshVoices = () => {
    const voices = getJapaneseVoices() || [];
    if (!voices.length) return;
    let savedVoiceURI = "";
    try { savedVoiceURI = localStorage.getItem(MAKER_VOICE_KEY) || ""; } catch {}
    const selected = voices.some((item) => item.voiceURI === savedVoiceURI) ? savedVoiceURI : voices[0].voiceURI;
    voiceSelect.innerHTML = voices.map((item, index) => `<option value="${escapeHtml(item.voiceURI)}">${index === 0 ? "女声优先 · " : ""}${escapeHtml(item.name)}</option>`).join("");
    voiceSelect.value = selected;
  };
  refreshVoices();
  if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", refreshVoices, { once: true });
  voiceSelect.onchange = () => {
    try { localStorage.setItem(MAKER_VOICE_KEY, voiceSelect.value); } catch {}
    currentTiming = null;
    timingStatus.textContent = "声音已更换，下次朗读时会重新测量时长。";
  };

  const getMatchedPlaybackRate = async () => {
    if (!currentTiming) {
      timingStatus.textContent = "正在静音测量中文原句与假名，请稍候…";
      currentTiming = await calibrateSpeechTiming(result.input, result.kana, voiceSelect.value);
    }
    updateTimingStatus();
    return clampNumber(currentTiming.matchedRate * Number(playbackSlider.value), 0.25, 4);
  };

  document.querySelector("#maker-copy").onclick = () => {
    if (!("clipboard" in navigator)) return;
    const text = `${result.kana}\n${result.romaji}`;
    navigator.clipboard.writeText(text).catch(() => {});
    output.querySelector("#maker-copy").textContent = "已复制到剪贴板";
    window.setTimeout(() => {
      if (output.querySelector("#maker-copy")) {
        output.querySelector("#maker-copy").textContent = "复制结果";
      }
    }, 1600);
  };

  document.querySelector("#maker-speak").onclick = async () => {
    const button = document.querySelector("#maker-speak");
    button.disabled = true;
    button.textContent = "正在匹配朗读时长";
    const rate = await getMatchedPlaybackRate();
    button.disabled = false;
    playSpeech(result.kana, rate, {
      voiceURI: voiceSelect.value,
      onstart: () => { button.textContent = "正在聆听"; },
      onend: () => { button.textContent = "朗读生成句子"; },
      onerror: () => { button.textContent = "朗读生成句子"; },
    });
    };

  document.querySelector("#maker-save-audio").onclick = async () => {
    const button = document.querySelector("#maker-save-audio");
    if (!(navigator.mediaDevices?.getDisplayMedia) || !("MediaRecorder" in window) || !("speechSynthesis" in window)) {
      window.alert("当前浏览器不支持保存朗读音频。");
      return;
    }
    let capture;
    try {
      button.textContent = "请选择当前标签页并共享音频";
      capture = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const audioTracks = capture.getAudioTracks();
      if (!audioTracks.length) throw new Error("没有共享音频轨道");
      const audioStream = new MediaStream(audioTracks);
      const chunks = [];
      const recorder = new MediaRecorder(audioStream, MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? { mimeType: "audio/webm;codecs=opus" } : undefined);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `空耳-${result.input.slice(0, 12).replace(/[\\/:*?"<>|]/g, "_") || "朗读"}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        capture.getTracks().forEach((track) => track.stop());
        button.textContent = "保存音频";
      };
      recorder.start();
      speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(result.kana);
      voice.lang = "ja-JP";
      const savedTiming = currentTiming || {
        matchedRate: alignSpeechRate(result.input, result.kana),
        targetSeconds: estimateSpeechSeconds(result.kana, "ja-JP"),
        referenceSeconds: estimateSpeechSeconds(result.input, "zh-CN"),
        measured: false,
      };
      voice.rate = clampNumber(savedTiming.matchedRate * Number(playbackSlider.value), 0.25, 4);
      const japaneseVoice = getJapaneseVoice(voiceSelect.value);
      if (japaneseVoice) voice.voice = japaneseVoice;
      voice.onstart = () => { button.textContent = "正在录制朗读"; };
      voice.onend = () => window.setTimeout(() => recorder.stop(), 180);
      voice.onerror = () => recorder.stop();
      speechSynthesis.speak(voice);
    } catch {
      if (capture) capture.getTracks().forEach((track) => track.stop());
      button.textContent = "保存音频";
      window.alert("未取得标签页音频。请选择当前标签页，并勾选“共享标签页音频”。");
    }
  };

  document.querySelector("#maker-share-audio").onclick = async () => {
    const shareData = { title: "音逢·句句生成器", text: result.kana };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.text);
        window.alert("当前设备不支持直接分享，已复制朗读内容，可粘贴发送。");
      }
    } catch (error) {
      if (error?.name !== "AbortError") window.alert("分享未完成，已保留生成结果。");
    }
  };

  document.querySelector("#maker-restart").onclick = () => {
    makerVersion += 1;
    const next = buildMakerSentence(result.input, makerVersion, makerMode);
    const learning = recordGeneratedMappings(next);
    const audit = auditMappingAnomalies();
    next.note += ` 本次入库 ${learning.added} 个生字，待校对 ${learning.pending} 个；异常检查：同字冲突 ${audit.charConflicts}，同拼音冲突 ${audit.pinyinConflicts}。`;
    renderMaker(next);
    addMakerHistory(next);
  };
}

function renderHistory() {
  const holder = document.querySelector("#maker-history");
  const list = holder.querySelector("ol");
  const counter = holder.querySelector("p");
  const limit3Checkbox = document.querySelector("#maker-limit-3");
  const showLimit3 = limit3Checkbox ? limit3Checkbox.checked : false;
  const normalized = showLimit3 ? makerHistory.slice(0, 3) : makerHistory;
  counter.textContent = `共 ${makerHistory.length} 条 · 当前显示 ${normalized.length} 条`;
  list.innerHTML = normalized.length === 0
    ? "<li>暂无记录，首次生成后会自动保存到本地。</li>"
    : normalized
      .map((entry) => `
        <li>
          <button class="history-item" data-id="${entry.id}">
            <span>${entry.input}</span>
            <small>
              ${formatHistoryTime(entry.createdAt) ? `生成于 ${formatHistoryTime(entry.createdAt)} · ` : ""}
              ${entry.kana}
              <span> · 纯音节</span>
            </small>
          </button>
        </li>`).join("");

  list.querySelectorAll(".history-item").forEach((item) => {
    item.onclick = () => {
      const id = item.dataset.id || "";
      const target = makerHistory.find((record) => record.id === id);
      if (!target) return;
      document.querySelector("#maker-input").value = target.input;
      renderMaker({
        input: target.input,
        kana: target.kana,
        romaji: target.romaji,
        confidence: target.confidence,
        note: target.note,
        mode: target.mode || "syllable",
      });
      const makerInput = document.querySelector("#maker-input");
      if (makerInput) {
        makerInput.focus();
      }
    };
  });
}

function addMakerHistory(item) {
  const now = {
    ...item,
    mode: item.mode || "syllable",
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };
  const dedupe = makerHistory.filter((record) => record.input !== item.input);
  makerHistory = saveMakerHistory([now, ...dedupe]);
  renderHistory();
  return now;
}

function showMakerEmpty() {
  document.querySelector("#maker-output").innerHTML = `
    <div class="empty-state">
      <span>音</span>
      <h3>先写一句，你将听见它的另一种读法</h3>
      <p>支持中文、日文及符号混合输入；每个字符都会按你的模式重写。</p>
    </div>
  `;
}

function loadMakerMode() {
  const savedMode = localStorage.getItem(MAKER_MODE_KEY);
  if (savedMode === "semantic") {
    makerMode = "syllable";
    localStorage.setItem(MAKER_MODE_KEY, "syllable");
  } else if (savedMode === "syllable") {
    makerMode = savedMode;
  }
  if (!savedMode || (savedMode !== "syllable" && savedMode !== "semantic")) {
    makerMode = "syllable";
  }
  const defaultInput = document.querySelector(`#maker-mode-${makerMode}`);
  if (defaultInput) {
    defaultInput.checked = true;
  }
}

function bindMakerModeSwitches() {
  const syllable = document.querySelector("#maker-mode-syllable");
  const semantic = document.querySelector("#maker-mode-semantic");
  if (syllable) {
    syllable.onchange = () => {
      if (!syllable.checked) return;
      makerMode = "syllable";
      localStorage.setItem(MAKER_MODE_KEY, makerMode);
    };
  }
  if (semantic) {
    semantic.onchange = () => {
      if (!semantic.checked) return;
      makerMode = "syllable";
      localStorage.setItem(MAKER_MODE_KEY, makerMode);
    };
  }
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  const toggle = document.querySelector("#theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(next === "dark"));
    const label = toggle.querySelector("b");
    if (label) label.textContent = next === "dark" ? "浅色" : "深色";
  }
  try { localStorage.setItem("otowai-theme", next); } catch {}
}

function bindThemeToggle() {
  const toggle = document.querySelector("#theme-toggle");
  if (!toggle) return;
  applyTheme(document.documentElement.dataset.theme);
  toggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

function bindMakerExamples() {
  const samples = [
    "今天我去图书馆学习", "窗外下雨了", "咖啡很好喝", "明月照山河", "机器人正在学习",
    "天气变冷记得多穿衣服", "朋友一起去公园散步", "周末我们坐火车回家", "早晨阳光照进房间", "孩子喜欢读故事",
    "电脑帮助我们工作", "春天花开风很轻", "晚上回家看电影", "大家一起吃晚饭", "小猫坐在窗边",
    "雨后天空出现彩虹", "明天准备去旅行", "书桌旁放着一杯茶", "清晨听见鸟叫", "我们沿着河边慢慢走"
  ];
  const list = document.querySelector("#maker-example-list");
  const refresh = document.querySelector("#maker-examples-refresh");
  if (!list || !refresh) return;
  let refreshReadyAt = 0;

  const bindSampleButtons = () => {
    list.querySelectorAll("[data-maker-example]").forEach((button) => button.addEventListener("click", () => {
      const input = document.querySelector("#maker-input");
      if (!input) return;
      input.value = button.dataset.makerExample || "";
      document.querySelector("#maker-generate").click();
    }));
  };
  const renderSamples = () => {
    const shuffled = [...samples].sort(() => Math.random() - 0.5).slice(0, 5);
    list.innerHTML = shuffled.map((sample) => `<button type="button" data-maker-example="${escapeHtml(sample)}">${escapeHtml(sample)}</button>`).join("");
    bindSampleButtons();
  };
  refresh.addEventListener("click", () => {
    const now = Date.now();
    if (now < refreshReadyAt) return;
    refreshReadyAt = now + 3000;
    renderSamples();
  });
  renderSamples();
}

document.querySelector("#search").addEventListener("input", render);
document.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => {
  category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach(item => item.classList.toggle("active", item === button));
  render();
}));
document.querySelector("#random").addEventListener("click", () => {
  daily = (daily + 1) % entries.length;
  const entry = entries[daily];
  document.querySelector("#daily-number").textContent = `NO. ${String(daily + 1).padStart(3,"0")}`;
  document.querySelector("#daily-chinese").textContent = entry.chinese;
  document.querySelector("#daily-kana").textContent = entry.kana;
  document.querySelector("#daily-romaji").textContent = entry.romaji;
  document.querySelector("#daily-score").innerHTML = `${entry.score}<sup>%</sup>`;
  const button = document.querySelector(".featured-card .speak");
  button.dataset.kana = entry.kana;
});
document.querySelector("#idea-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  localStorage.setItem("otowai-draft", JSON.stringify({...data, submittedAt: new Date().toISOString()}));
  event.currentTarget.reset();
  document.querySelector("#success").hidden = false;
});

document.querySelector("#maker-generate").addEventListener("click", () => {
  const raw = document.querySelector("#maker-input").value;
  if (!raw.trim()) return;
  makerVersion += 1;
  const result = buildMakerSentence(raw, makerVersion, makerMode);
  const learning = recordGeneratedMappings(result);
  const audit = auditMappingAnomalies();
  result.note += ` 本次入库 ${learning.added} 个生字，待校对 ${learning.pending} 个；异常检查：同字冲突 ${audit.charConflicts}，同拼音冲突 ${audit.pinyinConflicts}。`;
  renderMaker(result);
  addMakerHistory(result);
});

document.querySelector("#maker-clear").addEventListener("click", () => {
  document.querySelector("#maker-input").value = "";
  showMakerEmpty();
});
document.querySelector("#maker-clear-history").addEventListener("click", () => {
  makerHistory = [];
  saveMakerHistory(makerHistory);
  renderHistory();
});
document.querySelector("#maker-limit-3").addEventListener("change", renderHistory);

makerHistory = loadMakerHistory();
loadMappings();
loadRemoteMappings();
loadMakerMode();
bindMakerModeSwitches();
bindMappingEditors();
bindAdminMappingView();
bindThemeToggle();
bindMakerExamples();
render();
bindSpeakers();
renderHistory();
