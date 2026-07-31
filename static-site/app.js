const entries = [
  {chinese:"忽逢桃花林",kana:"ふふん たお はりん",romaji:"fu fun tao ha rin",source:"陶渊明《桃花源记》",category:"古文",score:92,note:"像一阵风把桃花源的入口吹进了日语假名里。"},
  {chinese:"山有木兮木有枝",kana:"さん よう むー しー むー よう じー",romaji:"san yō mū shī mū yō jī",source:"《越人歌》",category:"诗词",score:81,note:"舒展的元音，让古老诗句有了另一种节拍。"},
  {chinese:"清风明月",kana:"ちん ふう みん げつ",romaji:"chin fū min getsu",source:"汉字音联想",category:"诗词",score:86,note:"汉字音读与中文发音互相映照，清亮而短促。"},
  {chinese:"少年",kana:"しょうねん",romaji:"shōnen",source:"汉字词",category:"日常",score:95,note:"同一组汉字，在两种语言里保留了熟悉的回声。"},
  {chinese:"上海",kana:"しゃんはい",romaji:"shan hai",source:"地名",category:"地名",score:98,note:"日语对中文地名的音译，几乎可以隔岸相认。"},
  {chinese:"青山",kana:"せいざん",romaji:"seizan",source:"汉字音联想",category:"地名",score:78,note:"不是完全相同，却像两座山在声音里遥相呼应。"}
];

let category = "全部";
let daily = 0;
const entriesEl = document.querySelector("#entries");

function speak(kana, button) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(kana);
  voice.lang = "ja-JP";
  voice.rate = .72;
  voice.onstart = () => button.innerHTML = "<span>◼</span> 正在聆听";
  voice.onend = () => button.innerHTML = "<span>▶</span> 听听声音";
  speechSynthesis.speak(voice);
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
render();
bindSpeakers();
