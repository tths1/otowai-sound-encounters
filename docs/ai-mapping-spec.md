# 音逢 AI 映射模块规范

## 目标

语言模型负责根据中文原文生成中日谐音候选；系统负责结构校验、质量提示、缓存和人工审核。模型结果不得直接覆盖已发布映射。

## 生命周期

`draft_ai_generated` → `pending_review` → `published` 或 `rejected`

## 输入

```json
{
  "source": "忽逢桃花林",
  "context": "陶渊明《桃花源记》",
  "maxAlternatives": 3
}
```

`context` 可为空。模型必须把发音相似、真实日语词义和文化解释分开，不能把谐音候选宣称为标准日语表达。

## 输出契约

```json
{
  "source": "忽逢桃花林",
  "pinyin": "hū féng táo huā lín",
  "kana": "ふふん たおはりん",
  "romaji": "fufun taoharin",
  "segments": [
    {"source": "忽逢", "pinyin": "hū féng", "kana": "ふふん", "reason": "音节近似"}
  ],
  "alternatives": [],
  "explanation": "说明声音对应关系，不宣称语义等同。",
  "confidence": 0.76,
  "warnings": ["不是标准日语表达，需人工校对"],
  "model": "provider/model-id",
  "promptVersion": "mapping-v1",
  "status": "pending_review"
}
```

## 硬性校验

- `source`、`pinyin`、`kana`、`romaji`、`segments`、`warnings` 必须存在。
- `confidence` 必须是 0 到 1 的数字。
- `alternatives` 最多 3 个；每个候选必须包含 `kana`、`romaji`、`reason`。
- 禁止模型直接写入已发布词库；审核前只存草稿。
- 发现非法假名、空候选、过长输出或非 JSON 响应时，整条结果作废并提示重试。
- 前端不得直接暴露模型密钥；调用必须经过 Netlify Function。

## 提示词边界

模型必须区分“发音相似”“视觉相似”“真实日语自然度”和“文化解释”。不确定时写入 `warnings`，不得编造词源、出处或日语词义。

