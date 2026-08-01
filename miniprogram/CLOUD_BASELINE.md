# 微信小程序云开发基线

## 目标

把现有网站迁移为微信小程序时，保留核心产品能力，替换基础设施：

- 登录：Supabase Auth -> 微信授权登录
- 数据库：Supabase -> 云开发数据库
- 存储：Supabase Storage -> 云存储
- API：Next.js Route Handlers -> 云函数
- 变现：Stripe/支付 -> 微信广告

## 建议集合设计

### `users`

- `_id`
- `openid`
- `unionid`
- `nickName`
- `avatarUrl`
- `createdAt`
- `lastLoginAt`

### `pets`

- `_id`
- `userId`
- `name`
- `species`
- `breed`
- `age`
- `gender`
- `photoFront`
- `photoLeft`
- `photoRight`
- `photoCover`
- `visualProfileId`
- `createdAt`
- `updatedAt`

### `personality_results`

- `_id`
- `userId`
- `petId`
- `pbtiCode`
- `personalityType`
- `answers`
- `dimensionScores`
- `report`
- `language`
- `createdAt`

### `portrait_jobs`

- `_id`
- `userId`
- `petId`
- `resultId`
- `status`
- `templateId`
- `customPrompt`
- `rewardToken`
- `createdAt`
- `completedAt`

### `portrait_assets`

- `_id`
- `userId`
- `petId`
- `resultId`
- `kind`
- `imageFileId`
- `imageTempUrl`
- `prompt`
- `model`
- `createdAt`

### `ad_reward_logs`

- `_id`
- `userId`
- `scene`
- `rewardToken`
- `verified`
- `createdAt`

## 云函数建议

### `auth`

- `login`
- 输入：`code`、用户微信资料
- 输出：`openid`、会话信息、用户基础档案

### `pet`

- `saveProfile`
- `listMine`
- `getDetail`

### `visualProfile`

- `analyze`
- 上传三张图后调用外部视觉模型

### `report`

- `submitAssessment`
- `getDetail`
- `listMine`

### `portrait`

- `generate`
- `listMine`
- `saveToAlbumTicket`

### `ads`

- `issueRewardToken`
- `verifyRewardToken`

## 广告接入建议

- `banner ad`
  - 首页底部
  - 结果页中段
  - 我的页面底部
- `rewarded video ad`
  - 完整报告解锁前
  - 每次 AI 写真生成前

## 迁移顺序

1. 先把当前 `miniprogram/` 页面骨架跑通。
2. 接入微信授权登录和 `auth` 云函数。
3. 接云数据库与云存储，打通测试记录和结果保存。
4. 迁移视觉识别与报告生成逻辑。
5. 迁移写真任务与作品库。
6. 最后接入广告激励校验和风控。
