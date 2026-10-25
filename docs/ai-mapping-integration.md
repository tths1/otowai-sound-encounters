# AI 映射接入说明

当前实现使用 Gemini Developer API 的免费层作为管理员草稿生成器。

## 配置

在 Netlify 的环境变量中设置：

```text
GEMINI_API_KEY=你的密钥
GEMINI_MODEL=gemini-2.5-flash
PUBLIC_AI_ENABLED=true
```

密钥只放在 Netlify Functions 环境变量中，不能放入前端代码或提交到 Git。

## 调用

管理员登录后向同源接口发送：

```http
POST /api/ai/mapping
Content-Type: application/json
```

```json
{
  "source": "忽逢桃花林",
  "context": "陶渊明《桃花源记》"
}
```

公开生成器会调用 `/api/ai/mapping`；接口按 IP 每分钟最多处理 5 次，输入长度也有限制。接口只返回 `pending_review` 草稿，不会自动写入 `/api/mappings` 的已发布映射。

## 成本和限制

免费层不是无限调用；模型、地区和账户的配额可能变化。正式开放给访客前，应增加调用频率限制、缓存和管理员审核。收到 429 时，前端应提示稍后重试，而不是自动重复请求。

