# PBTI 微信小程序（纯中文）

这是网站的原生微信小程序工程，开发目录就是当前 `miniprogram` 文件夹。

## 已实现

- 微信静默身份初始化（演示期可先走本地会话）
- 宠物档案：猫 / 狗、名字、品种、年龄、性别
- 相册或相机选择三张宠物照片
- 猫狗各自一套 28 题行为测试
- 与网站一致的四维评分和 12 种 PBTI 原型匹配
- 性格结果、四维倾向、10 章中文报告
- 本地历史报告、分享入口
- AI 写真创建页与作品库
- 首页、结果页、报告页、“我的”页广告位规划
- 激励广告解锁完整报告 / AI 写真的交互占位
- 小程序专用后端接口：微信登录、宠物建档、照片上传、视觉识别、写真生成、写真库读取

## 正式上线前必须配置

1. 在 `project.config.json` 中将 `touristappid` 换成正式小程序 AppID。
2. 在微信公众平台开通流量主，创建 Banner、原生模板和激励视频广告位，并把广告单元 ID 写入相应页面。
3. 建立服务端 `/api/wechat/login`，使用 `wx.login` 返回的 `code` 换取 `openid` 与业务会话。AppSecret 只能放服务端。
4. 在微信公众平台配置 request / uploadFile / downloadFile 合法域名，且必须为已备案 HTTPS 域名。
5. 将照片上传、视觉识别、AI 写真和作品库接到现有网站后端；通义模型密钥只能放服务端。
6. 补齐隐私保护指引：说明宠物照片用途、保存期限、删除方式，并在真机检查隐私接口。

## 广告策略

- 首页：只放一个低干扰 Banner 或原生模板广告。
- 测评过程：不插屏，避免打断 28 题完成率。
- 结果页：结果摘要免费；看一次激励视频解锁完整 10 章报告。
- 报告页：章节中间最多一个原生模板广告。
- AI 写真：每看完一次激励视频获得一次生成机会，并设置每日上限控制模型成本。
- “我的”：历史记录底部放低干扰广告。

不要在用户未主动触发时强制播放激励广告；广告失败时应提供稍后重试，不扣生成次数。

## 建议后端数据模型

- `wechat_users`: `id`, `openid_hash`, `unionid_hash`, `created_at`, `last_seen_at`
- `pets`: `id`, `user_id`, `name`, `species`, `breed`, `age`, `gender`, `created_at`
- `pet_photos`: `id`, `pet_id`, `object_key`, `view`, `created_at`
- `assessments`: `id`, `pet_id`, `answers`, `scores`, `personality_code`, `model_version`, `created_at`
- `portraits`: `id`, `pet_id`, `object_key`, `style`, `prompt_version`, `created_at`
- `ad_rewards`: `id`, `user_id`, `scene`, `reward_token`, `status`, `created_at`, `consumed_at`

服务端不要保存明文 `openid`，至少使用带服务端密钥的 HMAC 后再作为业务标识。
