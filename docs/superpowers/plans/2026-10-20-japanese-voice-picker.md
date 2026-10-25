# 日语音色选择 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本地制造器中加入用户选定的第一款女声和第三款男声，保留现有女声为默认。

**Architecture:** 浏览器传递白名单音色 ID，由本地后端调用现有异步语音处理器。密钥只从本地环境读取；保留已有配额、任务幂等和音频缓存机制。

**Tech Stack:** Node.js、原生浏览器 JavaScript、Netlify Blobs、MiniMax/apiz。

**Spec:** 用户要求“两三个可用的日语音色测试后加入网站，默认保留现在的女声”。测试脚本为 `scripts/check-japanese-voices-live.mjs`。

## Global Constraints

- 可选音色：`Japanese_CalmLady`（默认女声）、`Japanese_GentleButler`（男声）。按用户最新选择，不加入第二款。
- 保留 `language_boost: Japanese`、合成速度 `1`，不对测试音频变声。
- 只修改本地版本，不发布线上网站。
- 切换选项不创建付费任务；用户主动点击生成才调用接口。
- `.env.local` 不提交、不提供给浏览器，不记录密钥。
- 保留用户已有的未提交修改和输入内容。

## Review Focus

- 同一任务 ID 换音色：必须拒绝，不能误播旧音色。
- 任意伪造音色 ID：在付费调用前拒绝。
- 合成期间切换：禁用选择器，避免旧请求覆盖新选项。
- 播放/下载已生成音频：继续复用缓存，不重复付费。
- 默认预览代理不能支持新音色：显式启动本地后端模式，不假装线上后端已更新。

### Task 1: 服务端音色白名单与任务身份

**Files:** `netlify/functions/lib/apiz-audio.mjs`、`tests/apiz-audio.test.mjs`。

**Interfaces:** `createApizAudioHandler` 接受现有请求中的 `voice`；`default` 仍解析为服务端当前音色。

- [x] 添加测试：选定音色进入上游 `voice_id`；非法音色返回 400 且不调用上游；同 ID 换音色返回 409。
- [x] 运行测试，确认因尚未实现上述行为而失败。
- [x] 实现白名单及任务音色绑定，兼容旧任务查询。
- [x] 重跑该文件及完整测试，检查原默认音色和配额行为不变。

### Task 2: 本地后端接通

**Files:** `scripts/local-preview.mjs`、`tests/local-preview.test.mjs`。

**Interfaces:** `createLocalPreviewServer({audioHandler})` 可注入本地语音处理器；CLI `--local-audio` 加载本地环境中的密钥。

- [x] 添加测试：可将请求交给本地处理器；仍拒绝跨站来源、非法 Host 和过大请求，不向网页泄露环境变量。
- [x] 确认新增行为测试失败，再实现本地后端模式；默认代理模式不变。
- [x] 运行测试；重启本地服务前确认当前监听进程，保留端口 4174。

### Task 3: 制造器选择器与浏览器验证

**Files:** `static-site/app.js`、必要的 `static-site/style.css`、`tests/maker-audio.test.mjs`、`scripts/check-aiweb-browser.mjs`。

**Interfaces:** `#maker-ai-voice` 控制当前结果的 `voice`；选择本身不生成音频。

- [x] 添加失败测试：默认女声、两种选项、选择后提交正确 ID、合成期间禁用选择、输入不变。
- [x] 添加选择器；切换后清除当前播放器及会话，明确提示再次生成会产生费用；同音色重复播放/下载保留缓存。
- [x] 运行全套单元测试；浏览器使用拦截的音频夹具验证，不增加付费任务。
- [x] 验证桌面/手机布局及音频可播放；本地接口查询两款已有音频均返回 200，哈希与原测试文件相同。

验证记录：80 项 Node 测试通过；浏览器夹具测试通过；独立检查未发现问题。当前环境未安装 npm/vinext，未运行生产构建。未部署线上。

## 已完成的接口预检

- [x] 三种音色使用同一句 `こんにちは。今日はいい天気ですね。` 完成生成。
- [x] 原始 MP3 已保存在被 Git 忽略的 `outputs/voice-tests/`。
- [x] 本地密钥文件已忽略且权限为 600。
- [x] 用户确认“第一第三款加入”。

## 追加：高尖预设与低沉单次重试（用户已批准）

- [x] 新增失败测试后，实现 `Japanese_CalmLady_ExtremeHigh` 预设；服务端转换为女声与已试听的极端参数，默认女声不变。
- [x] 切换预设仍不合成，任务绑定预设身份，语速保持 1。
- [x] 全套 82 项测试通过，本地浏览器 9 次夹具请求通过（不付费）；移动端高尖选择器与播放器已检查。
- [x] 低沉版新建一次付费请求成功，保留原不确定任务记录，不自动重复提交。独立审查发现重试模式在日志缺失时会走普通实验，已改为缺失即拒绝、只处理低沉；无网络隔离检查通过。
- [x] 低沉原始 MP3 116340 字节，Chrome 解码 2.808 秒，峰值 0.901、RMS 0.208，交付原速试听；不自动加入网站、不部署。

本地后端已重启加载预设。生产构建仍未执行（环境无 npm/vinext），没有声称部署或生产构建通过。

## 追加：轻度低沉（试听后用户批准加入）

- [x] 使用试听参数：`Japanese_GentleButler`，pitch -4、speed 1、vol 1、emotion calm，不附加 `voice_modify`。
- [x] 先验证缺失功能测试失败，再加入 `Japanese_GentleButler_MildLow` 预设和“轻度低沉”选项；默认女声与其余选项不变。
- [x] 任务身份按预设区分；切换不自动合成；84 项测试通过。
- [x] 本地后端已重启；浏览器 10 次夹具请求通过，包括轻度低沉切换与重复播放缓存；手机界面已检查。独立审查无问题，聚焦 30 项测试通过。没有新付费合成或部署。
