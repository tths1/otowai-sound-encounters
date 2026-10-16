# AI 音频提供器接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为音逢空耳制造器增加可配置的 AI 音频生成链路，并保留浏览器朗读回退、时长匹配、下载和分享能力。

**Architecture:** 浏览器通过统一 `generateAudio` 提供器调用 `/api/audio`；Netlify Function 负责环境变量、超时、上游响应校验和错误归一化；前端将返回 Blob 包装成可播放的 `HTMLAudioElement`，失败时继续使用现有 `speechSynthesis`。

**Tech Stack:** 原生 JavaScript、Netlify Functions、Node Test Runner、Web Audio/HTMLAudioElement、Web Speech API。

**Spec:** `docs/superpowers/specs/2026-10-16-ai-audio-provider-design.md`

## Global Constraints

- 运行时接口密钥只允许存在于 Netlify 环境变量，不得进入 `static-site/`、`dist/` 或 `localStorage`。
- 外部接口格式未知时只实现统一代理边界和适配入口，不猜测第三方字段。
- AI 音频不可用时必须自动回退到浏览器朗读。
- AI 音频的下载保存原始 Blob；速度滑条只影响播放速度。
- 访客只有点击朗读或保存音频后才发送生成请求。

## Review Focus

- 未配置 AI 服务时，点击朗读仍能回退到浏览器语音；测试归 Task 3。
- 上游返回 JSON 错误、空响应或非音频 MIME 时，代理不泄漏响应正文；测试归 Task 2。
- AI 音频 duration 为 0、NaN 或未就绪时，前端不出现 NaN 播放速率；测试归 Task 3。
- 重复生成同一句时，对象 URL 和旧音频元素会清理；测试归 Task 1/3。
- 移动端不支持标签页录音时，AI Blob 下载仍可用；测试归 Task 3。

### Task 1: 音频提供器核心与错误模型

**Files:**
- Create: `static-site/audio-provider.js`
- Modify: `scripts/build-static.mjs`
- Test: `tests/audio-provider.test.mjs`

**Interfaces:**
- Produces `createAudioProvider(options)` and `generateAudio(request)`.
- `generateAudio(request)` returns `{ blob, mimeType, duration, provider }` or throws an error with `code` and `userMessage`.
- Provider owns `URL.createObjectURL` cleanup helpers and does not know page DOM.

- [ ] **Step 1: Write failing tests** for request validation, non-audio response rejection, empty Blob rejection, normalized success result, and object URL cleanup.
- [ ] **Step 2: Run `node --test tests/audio-provider.test.mjs` and verify the new tests fail because the module is missing.
- [ ] **Step 3: Implement the provider module** with `validateAudioRequest`, `normalizeAudioResponse`, `createAudioProvider`, and `revokeAudioUrl`.
- [ ] **Step 4: Run the focused tests and verify they pass.**
- [ ] **Step 5: Add `static-site/audio-provider.js` to the static build and run the static build check.**
- [ ] **Step 6: Commit `feat: add audio provider boundary`.**

### Task 2: Netlify audio proxy boundary

**Files:**
- Create: `netlify/functions/audio.ts`
- Modify: `netlify/functions/package.json`
- Modify: `.env.example`
- Test: `tests/audio-function.test.mjs`

**Interfaces:**
- Function exports `handler(event)` and accepts `POST /api/audio` with `{ text, language, voice, speed }`.
- Returns audio bytes with the upstream MIME type on success.
- Returns JSON `{ code, message }` for validation, configuration, timeout, upstream and response-format failures.
- Environment variables: `AI_AUDIO_ENABLED`, `AI_AUDIO_URL`, `AI_AUDIO_KEY`, `AI_AUDIO_MODEL`, `AI_AUDIO_TIMEOUT_MS`.

- [ ] **Step 1: Write failing tests** for missing method/body, disabled provider, missing URL/key, upstream timeout, non-audio response, and successful audio passthrough using a dependency-injected `fetch`.
- [ ] **Step 2: Run `node --test tests/audio-function.test.mjs` and verify the tests fail because the function is missing.
- [ ] **Step 3: Implement the proxy** with strict input limits, `AbortController` timeout, redacted errors, and a single `callUpstream` adapter entry point whose payload remains isolated for the later interface-specific mapping.
- [ ] **Step 4: Run the focused tests and verify they pass.**
- [ ] **Step 5: Run TypeScript syntax/type checks available in the function package.**
- [ ] **Step 6: Commit `feat: add protected AI audio proxy`.**

### Task 3: Frontend AI audio playback, timing, fallback and download

**Files:**
- Modify: `static-site/app.js`
- Modify: `static-site/index.html`
- Modify: `static-site/style.css`
- Test: `tests/maker-audio.test.mjs`

**Interfaces:**
- `createAudioSession(result)` returns `{ generate, play, stop, download, dispose }` for one generated result.
- The session reports `provider`, `status`, `duration`, and `errorCode` through callbacks.
- Existing `playSpeech` remains the browser fallback and receives the same matched rate calculation.

- [ ] **Step 1: Write failing tests** for AI generation status, AI duration-based playback rate, provider failure fallback, disabled download during generation, and object URL disposal when a new result is rendered.
- [ ] **Step 2: Run `node --test tests/maker-audio.test.mjs` and verify the tests fail because the session is missing.
- [ ] **Step 3: Implement the session** using `audio-provider.js`, an `HTMLAudioElement`, safe playback-rate calculation, status callbacks, and Blob download.
- [ ] **Step 4: Replace only the result-area event handlers** for “朗读生成句子”, “保存音频”, and “分享朗读”; preserve copy, history, voice selection, and browser fallback.
- [ ] **Step 5: Add visible status text and accessible busy/disabled states.**
- [ ] **Step 6: Run focused tests and the existing static page tests; verify all pass.**
- [ ] **Step 7: Run a local browser smoke test for generate → AI unavailable → browser fallback and verify no console errors.**
- [ ] **Step 8: Commit `feat: use AI audio with browser fallback`.**

### Task 4: Configuration, documentation and delivery checks

**Files:**
- Modify: `README.md`
- Modify: `docs/技术说明.md`
- Modify: `docs/AI辅助开发记录.md`
- Modify: `docs/参赛提交清单.md`
- Modify: `netlify.toml`
- Test: `tests/audio-delivery.test.mjs`

**Interfaces:**
- Documentation describes the AI audio proxy, required variables, privacy boundary, fallback, and the remaining interface-specific mapping step.
- Delivery test verifies the build includes `audio-provider.js` and does not include `.env` or key literals.

- [ ] **Step 1: Write failing delivery tests** for build asset inclusion, config template coverage, and secret exclusion.
- [ ] **Step 2: Run `node --test tests/audio-delivery.test.mjs` and verify the tests fail for the missing documentation/build changes.
- [ ] **Step 3: Update build configuration and all user-facing documentation** with exact provider setup and fallback behavior.
- [ ] **Step 4: Run build, syntax checks, all Node tests, and `git diff --check`.**
- [ ] **Step 5: Commit `docs: document AI audio setup and fallback`.**

## Final Verification

Run:

```bash
node scripts/build-static.mjs
node --test tests/*.test.mjs
node --check static-site/app.js
node --check static-site/audio-provider.js
git diff --check
```

Expected: build exits 0, all tests pass, syntax checks exit 0, and `git diff --check` prints no errors. A browser smoke test must confirm an unconfigured AI provider falls back to browser speech without breaking the result area.
