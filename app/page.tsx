"use client";

import { FormEvent, useMemo, useState } from "react";

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

const entries: Entry[] = [
  {
    chinese: "忽逢桃花林",
    kana: "ふふん たお はりん",
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
    kana: "ちん ふう みん げつ",
    romaji: "chin fū min getsu",
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

function SoundButton({ kana }: { kana: string }) {
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
    <button className="sound-button" onClick={speak} aria-label={`朗读 ${kana}`}>
      <span aria-hidden="true">{speaking ? "◼" : "▶"}</span>
      {speaking ? "正在聆听" : "听听声音"}
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [daily, setDaily] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const inCategory = category === "全部" || entry.category === category;
      const haystack = `${entry.chinese} ${entry.kana} ${entry.romaji} ${entry.source}`.toLowerCase();
      return inCategory && (!normalized || haystack.includes(normalized));
    });
  }, [query, category]);

  const featured = entries[daily % entries.length];

  const submitIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
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
          <a href="#about">关于音逢</a>
          <a className="nav-cta" href="#submit">分享发现</a>
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
            <strong>ふふん たお はりん</strong>
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
              <input name="kana" required placeholder="例如：ふふん たお はりん" />
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
