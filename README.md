# 音逢｜中日谐音文化小志

> 在声音里，遇见另一种语言。

“音逢”是一个面向中日语言爱好者的互动网页项目。它不把中文翻译成日文，而是根据汉字拼音与日语假名的相近读音，生成可朗读的日语“空耳”表达，让使用者从声音角度重新观察汉字、假名与文化传播。

在线体验：[https://otowai-sound-encounters.netlify.app/](https://otowai-sound-encounters.netlify.app/)

代码仓库：[https://github.com/tths1/otowai-sound-encounters](https://github.com/tths1/otowai-sound-encounters)

## 项目亮点

- **空耳制造器**：输入中文、日文或混合词句，按逐字音感规则生成假名与发音。
- **非意译设计**：生成过程只处理读音相近性，不把“我”翻译成“わたし”等语义对应。
- **同音字复用**：相同拼音的汉字自动归入同一规则，输出更稳定，也便于持续校对。
- **朗读时长匹配**：首次朗读会静音测量中文原句和生成假名的语音时长，自动调整假名朗读语速，使两者节奏接近；用户仍可微调速度。
- **可检索词集与历史**：支持搜索已有词条，保存本机最近生成记录。
- **可维护的规则库**：管理者可更新拼音—假名映射；公共页面不显示编辑区。
- **响应式与深色模式**：适配电脑、手机浏览，并尊重减少动效偏好。

## 技术方案

| 模块 | 实现方式 |
| --- | --- |
| 前端页面 | HTML5、CSS3、原生 JavaScript |
| 音感生成 | 拼音映射表 + 同音字复用 + 未命中字的音节簇回退 |
| 浏览器朗读 | Web Speech API（`SpeechSynthesisUtterance`） |
| 时长匹配 | 静音实测中文和假名基准时长，按 `假名时长 / 中文时长` 自动换算朗读语速 |
| 本地状态 | `localStorage` 保存主题、历史和本地草稿 |
| 在线部署 | Netlify 静态托管 + Functions |
| 规则服务 | Netlify Functions、Netlify Blobs；写入接口需管理员身份 |

## 目录结构

```text
static-site/             公共网页源代码
  index.html             页面结构
  style.css              页面样式与响应式规则
  app.js                 词库、转换、朗读和交互逻辑
  pinyin-data.js         汉字拼音数据
  admin/                 管理端入口
netlify/functions/       映射规则读取与受保护写入接口
scripts/build-static.mjs 静态发布文件生成脚本
dist/client/             已生成的静态发布文件
docs/                    参赛技术说明、录屏脚本与提交清单
.env.example             环境变量配置说明模板
```

## 本地运行

项目可直接以静态站点方式预览：

```bash
node scripts/build-static.mjs
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist/client
```

然后打开 `http://127.0.0.1:4174/`。

如需同时调试 Netlify Functions，请先安装依赖并使用 Netlify 开发环境。

## 参赛材料

- [技术说明](docs/技术说明.md)
- [AI 辅助开发记录](docs/AI辅助开发记录.md)
- [演示录屏脚本](docs/演示录屏脚本.md)
- [提交前检查清单](docs/参赛提交清单.md)

## AI 使用说明

本作品将 AI 用于需求分析、方案设计、代码审查和测试用例设计；访客实际使用时不调用在线大模型，也不会上传输入内容。空耳生成由本项目的可校对拼音—假名规则引擎完成。完整过程见 [AI 辅助开发记录](docs/AI辅助开发记录.md)。

## 使用边界

本项目的“空耳”属于语言游戏和声音联想，不用于证明中文、日文读音存在严格的一一历史对应关系。词库会持续校对和扩充。
