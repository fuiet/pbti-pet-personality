# PBTI Project Handoff

Last updated: 2026-07-21

## 2026-07-21 Current Context — Read This First

This section is the authoritative current handoff. Older sections below are retained for background but may describe tasks that have since been completed.

Current workspace:

- Project path: `C:\Users\Administrator\Documents\Pbti`
- Branch: `main`
- Remote: `https://github.com/fuiet/pbti-pet-personality.git`
- Production deploy target: Cloudflare Pages, auto-deployed from pushes to `main`
- Production URL: `https://pbti-pet-personality.pages.dev`
- Current git state before this handoff edit: clean

Latest deployed commits:

- `d228100 Simplify portrait creation flow`
- `1ee53d9 Rename account portrait gallery button`
- `38df76a Point account portraits card to gallery`
- `69ae4de Refine portrait studio workspace`
- `6016cd7 Upgrade AI Portrait Studio templates`
- `ff48d0a Add AI Portrait Studio workspace`
- `33352f6 Remove memory entry points and enrich portrait expressions`
- `924be2d Update project handoff context`

Recent validation commands that passed:

```powershell
$env:PATH='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH; & 'C:\Users\Administrator\Documents\Pbti\node_modules\.bin\tsc.CMD' --noEmit
$env:PATH='C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH; & 'C:\Users\Administrator\Documents\Pbti\node_modules\.bin\next.CMD' build
```

### Immediate Handoff Priorities

- The website is live and currently deploys from pushes to `main`.
- The user's next major direction is to turn this product into a WeChat Mini Program.
- Treat the current website as the reference product for flows, copy, prompt logic, and visual behavior.
- If Mini Program work starts, begin from feature-parity planning instead of redesigning the product from scratch.

### Most Recent Portrait Studio State

- Main create page: `app/account/portraits/page.tsx`
- Full library page: `app/account/portraits/library/page.tsx`
- Portrait API: `app/api/portraits/route.ts`
- The portrait creation page was simplified heavily because the older version was too hard to understand.
- It now behaves more like a lightweight AI photo tool:
  - upload pet photo
  - optionally upload owner photo
  - optionally choose a built-in template
  - optionally add one short custom prompt
  - generate one image
- The right side is now a clean preview / empty state rather than a dense explanation panel.
- The "history" tab on the create page only shows recent work.
- The full saved gallery remains at `/account/portraits/library`.

### New Portrait Generation Behavior

- Portrait generation no longer has to start from an existing saved `petId`.
- `POST /api/portraits` now supports:
  - legacy mode: generate from an existing saved pet
  - upload-first mode: generate directly from `petPhotos`, `petSpecies`, and optional `petName`
- In upload-first mode, the backend automatically creates a lightweight pet record before saving the generated portrait.
- This means the new web flow supports:
  - open page
  - upload a new pet photo
  - generate a portrait directly
- Duo mode still requires owner photo upload.

### Account / Routing Details That Must Not Be Lost

- In account center, the "My portraits" card now links to `/account/portraits/library`, not to the portrait creation page.
- In account center, the gallery button wording was changed to:
  - Chinese: `写真图片库`
  - English: `Portrait gallery`
- The library page is the view-images destination.
- The portrait creation page should now be treated as a fresh generation surface, not a gallery.

### Migration Notes For WeChat Mini Program

- The strongest candidate for first Mini Program parity is the simplified portrait creation flow.
- Current web dependencies still include:
  - Supabase auth
  - Supabase database
  - Supabase storage
  - server-side DashScope/Qwen image generation through `/api/portraits`
- A Mini Program version will need equivalents for:
  - WeChat-compatible login/session strategy
  - mobile album/camera upload flow
  - backend generation proxy for DashScope
  - saved portrait persistence and gallery retrieval
- Preserve these output-quality rules during migration:
  - template image as actual generation reference
  - pet identity lock
  - anti-stiff-expression logic
  - PBTI-driven temperament / expression strategy

### Mini Program Feature-Parity Pages

- `/account/portraits`
  - simplified portrait creation entry
- `/account/portraits/library`
  - full saved portrait library
- `/report/[id]` and `/report/[id]/preparing`
  - report orchestration and portrait generation sequencing
- `/create`, `/upload`, `/quiz`
  - original report / test funnel

### Current Product Direction

PBTI is now a bilingual pet personality and portrait-generation website.

Supported languages:

- English: default/international language
- Simplified Chinese: native Chinese wording, not literal machine translation

Do not add Japanese or other languages unless the user explicitly asks again. Do not change the canonical English four-letter PBTI codes.

Canonical product claims currently used:

- 28 behavior questions
- 12 shared cat/dog personality types
- 10-chapter report
- 3 generated portrait assets

### Completed Since the Old 2026-07-15 Handoff

The old “Latest Unfinished Report Task” is mostly completed:

- Full report was expanded into a richer 10-chapter layout.
- Visible “Research Basis” and “Custom Model Boundary” cards were removed from the report.
- “Appearance Analysis” was renamed conceptually to “Pet Identification / 爱宠鉴定”.
- Photo-quality score was removed from the visible identification cards.
- A final disclaimer/important notice section was added.
- Report content is generated deterministically from the current model so old saved rows render safely.

Portrait and report work completed:

- Reports now route through `/report/[id]/preparing` before opening.
- Preparing page shows progress such as visual analysis, behavior analysis, portrait generation, and report preparation.
- The report opens only after all three portraits are generated/saved, reducing broken-image states.
- Portrait persistence uses Supabase `pet_portraits`; saved portraits are reused for the same pet/report instead of regenerating every view.
- Missing portrait table still requires running `supabase/pet-portraits.sql` in Supabase SQL Editor.
- Portrait generation is constrained to provider-supported 2K sizes:
  - avatar: `2048*2048`
  - vertical: `1632*2048`
  - landscape: `2048*1152` or provider-supported equivalent as implemented in `app/api/portraits/route.ts`
- The report cover's right-side image and the share-card artwork now use the avatar portrait, not the vertical portrait.
- The report cover avatar is enlarged to fill the right side from the top border.
- The built-in personality/type artwork was restored as fallback cover art if generated images fail to load.

Portrait prompt system completed:

- File: `lib/portraitPrompts.ts`
- Prompt version: `studio-v7`
- Old fixed prompt/style library was removed.
- There are now three fixed output slots:
  - `white-sketch-avatar` → 爱宠头像
  - `vertical-campaign` → 竖屏写真
  - `landscape-campaign` → 横屏写真
- Each slot has a template pool and randomly selects one prompt at generation time.
- Template pools are split by pet gender:
  - `male` pets prioritize cooler, sporty, explorer, scholar, streetwear, adventure, and urban directions.
  - `female` pets prioritize softer, cute, plush, pink, floral, celebration, dreamy, and healing directions.
  - If gender is not set, selection falls back to the full pool for that output kind.
- All prompts include strict identity preservation:
  - same species
  - same face shape
  - same coat color and markings
  - same eye color
  - same ears, nose/muzzle, body proportions, sex, and age impression
- Prompts instruct the image model not to generate words, logos, brand names, or watermarks; website post-processing adds the pet name and PBTI logo.

Portrait typography/compositing completed:

- File: `components/PortraitGenerator.tsx`
- The site composites the pet name and transparent PBTI logo after generation.
- `public/pbti-logo-transparent.png` is used; do not add a white backing rectangle.
- Download/copy use the composited PNG.
- The old single fixed text design was replaced by 7 stable-random typography layouts:
  - top-left bold headline with accent bars
  - slanted large poster type
  - bottom rounded name badge
  - orange outlined title
  - vertical side title
  - handwritten-style lower-right title
  - centered glowing line title
- The chosen text layout is deterministic per image URL + pet name, so it does not change randomly on every refresh.

User/account work completed:

- Account center supports deleting pets and reports, with confirmation.
- Account center pet/report avatars use user-uploaded pet photos when available.
- Account center portrait gallery shows saved portrait assets with pet association.
- Header shows the user's configured username instead of email when available.

Auth status:

- Registration was changed back to Supabase email confirmation link flow, not manual OTP code entry.
- UI should clearly tell users to click the confirmation link in their email.
- Login uses email + password; username login was intentionally not implemented.
- Google login can fail locally/for some users due to `accounts.google.com ERR_CONNECTION_CLOSED`; that is generally network/proxy-related rather than site code, but auth redirect configuration should still be preserved.

Question/test status:

- The quiz is 28 questions: 4 dimensions × 7 questions each.
- Chinese question wording was rewritten to sound natural in Simplified Chinese.
- Quiz page supports going back to the previous question.
- Home page statistic was changed from 36 questions to 28.

Create/profile status:

- Age and gender are side-by-side; gender is optional.
- Chinese gender labels should be `公 / 母`, not `妈妈`.
- Breed selector has localized Chinese breed names when language is Chinese.

Home page status:

- Added user stories, FAQ, and user feedback/review section.
- Fake/social-proof stats were toned down:
  - cumulative assessments should be around ten-thousand-plus, not 247,392
  - satisfaction label should not say “模拟满意度”
- If future work changes public stats, keep them plausible until real analytics are wired.

### Current High-Priority Follow-Up Checks

These are not necessarily broken, but are worth verifying after future changes:

1. Generate a brand-new report with a pet that has gender set to `公` and confirm:
   - preparing page creates all three portraits
   - avatar/vertical/landscape records save with `studio-v7`
   - report cover and share card use avatar
   - portrait gallery still shows all three assets
2. Generate a brand-new report with gender set to `母` and confirm gender-specific template selection feels softer/cuter.
3. Test a report where existing old `studio-v6` portraits exist; verify preparing page creates/reuses the expected current `studio-v7` assets rather than showing broken images.
4. Test Chinese mode end-to-end:
   - profile create
   - breed selector
   - optional gender
   - upload
   - quiz back button
   - report, share card, and portrait labels
5. Re-check portrait post-processing on generated images:
   - transparent PBTI logo has no white box
   - text variety is visible
   - long Chinese pet names do not overflow
   - download and copy export PNG with name/logo

### Important Current Files

- `lib/portraitPrompts.ts` — authoritative prompt template pools for avatar, vertical, and landscape portraits.
- `components/PortraitGenerator.tsx` — generation UI, composited name/logo, copy/download, typography layouts.
- `app/api/portraits/route.ts` — portrait generation, persistence, provider sizes, existing-asset reuse.
- `app/report/[id]/preparing/page.tsx` — report preparation/progress flow before opening report.
- `app/report/[id]/page.tsx` — 10-chapter report display, avatar cover image, share card source.
- `components/ShareCard.tsx` — downloadable/shareable report card using avatar artwork.
- `app/create/page.tsx` — pet profile, breed, age, optional gender.
- `app/quiz/page.tsx` — 28-question quiz, previous question support.
- `data/zhQuestions.ts` — natural Chinese question copy.
- `data/personalityLocalization.ts` — localized type names/explanations.
- `data/breedLocalization.ts` — Chinese breed display names.

### Current Working Rules

- Preserve all user changes. Never use `git reset --hard` or discard local edits unless the user explicitly asks.
- Do not regenerate the built-in cat/dog personality images.
- Do not mix Cat artwork and Dog artwork for known species.
- Do not change the canonical 12 personality names/codes without explicit user direction.
- Do not claim medical, legal, ancestry, or scientific certainty.
- Do not expose secrets or commit API keys.
- Verify locally before committing/deploying.
- Do not push/deploy unless the user explicitly says to submit, deploy, push, or similar.

### Current Task Starter

Use this message when starting a new Codex task:

```text
项目目录：C:\Users\Administrator\Documents\Pbti

请先阅读 HANDOFF.md 顶部的“2026-07-21 Current Context”，再检查 git status 和最近提交。继续用户最新明确任务。保留所有已有修改，不要重新生成内置性格图片；代码修改后先本地验证；除非我明确要求，否则不要自动提交、推送或部署。
```

This document is the durable context for continuing PBTI development in a new Codex task. Read this file first, then inspect `git status`, the latest commits, and the relevant source files before editing. Preserve all existing user work and uncommitted changes.

## New Task Starter

Use this message when starting a new Codex task:

```text
Project: C:\Users\Administrator\Documents\Pbti

Read HANDOFF.md first, then inspect git status and the latest commits. Continue the highest-priority unfinished task in HANDOFF.md. Preserve all existing and uncommitted changes, do not regenerate personality artwork, verify locally before pushing, and do not push or deploy unless I explicitly request it.
```

## Product Summary

PBTI (Pet Behavior Type Indicator) is a cat and dog personality assessment website for an overseas audience. The primary interface language is English. The language selector and translation architecture are reserved for later expansion.

Core journey:

1. Sign in with Google or email through Supabase Auth.
2. Create a pet profile with name, species, breed, and age.
3. Upload three photos: front face, left side, and right side.
4. Qwen-VL analyzes visible breed, coat, face, body, and possible mixed-breed cues.
5. Complete a species-specific 28-question behavior assessment.
6. Map answers to four custom PBTI dimensions and one of 12 profiles.
7. Save the pet, answers, scores, result, visual profile, report, and portraits to the signed-in Supabase account.
8. Show the full report and three identity-preserving portrait posters. Premium features are temporarily open during launch month.

Product claims currently used on the site:

- 28 behavior questions
- 12 personality types
- 10-chapter visual report
- 3 portrait posters

PBTI is an educational behavior indicator, not a veterinary diagnosis, validated clinical instrument, ancestry test, or legal certification.

## Canonical 12-Type System

Cats and dogs use the same names and four-letter codes. Never introduce a 16-type system or substitute other names.

| Order | Code | Name |
|---|---|---|
| 01 | IEVP | Explorer |
| 02 | ASVG | Guardian |
| 03 | ISCP | Dreamer |
| 04 | IEVG | Maverick |
| 05 | IECG | Scholar |
| 06 | AEVG | Leader |
| 07 | ASCP | Companion |
| 08 | ASCG | Healer |
| 09 | AEVP | Sunny |
| 10 | ISCG | Sentinel |
| 11 | AECP | Player |
| 12 | ISVG | Noble |

The four custom behavior axes are:

- A/I: Attachment vs Independence
- E/S: Exploration vs Stability
- V/C: Vitality vs Composure
- P/G: Playfulness vs Guardianship

Canonical implementation files:

- `data/personalities.ts`
- `data/personalityAssets.ts`
- `lib/pbtiEngine.ts`
- `data/catQuestions.ts`
- `data/dogQuestions.ts`

## Personality Artwork Rules

Do not regenerate the uploaded personality artwork.

Cat artwork:

- `public/assets/personalities/cats/01-explorer-cat.webp` through `12-noble-cat.webp`

Dog artwork:

- `public/assets/personalities/dogs/01-explorer-dog.png` through `12-noble-dog.png`

Required behavior:

- Cat profiles, tests, results, reports, and account cards use the matching Cat artwork.
- Dog profiles, tests, results, reports, and account cards use the matching Dog artwork.
- Never mix Cat and Dog artwork for a known pet species.
- The home page personality library alternates Cat and Dog artwork across the 12 types.
- The first profile-creation screen may use two Cat and two Dog images as neutral decoration before a species is confirmed.
- Artwork has a transparent background and should remain visually transparent when used as decoration.

Use `getPersonalityAsset(code, species)` from `data/personalityAssets.ts` instead of duplicating paths.

## Behavior and Report Model

The behavior model is informed by, but does not reproduce, published owner-observed behavior research:

- Cat behavior: Feline Five-style domains and related feline personality work.
- Dog behavior: C-BARQ-style owner observation and canine trait research.
- PBTI: a custom four-axis, 12-prototype educational model.

Rules:

- Questions must describe observable cat or dog behavior, not human personality scenarios.
- Behavior answers are the primary source for personality assignment.
- Photos can enrich appearance identification but cannot infer intelligence, aggression, health, ancestry certainty, or true personality.
- Prototype fit is a custom similarity score, not statistical confidence.
- Do not fabricate scientific certainty or claim that PBTI is Feline Five or C-BARQ.

Current report generation is in `lib/reportGenerator.ts`; display is in `app/report/[id]/page.tsx`.

## Latest Unfinished Report Task (Highest Priority)

This task was interrupted and has not been implemented yet:

1. Enrich the full report, especially `Love Language`, `Relationship`, and `Recommendations`. These should contain several useful, pet-specific paragraphs or structured subsections rather than one generic sentence.
2. Remove the visible `Research Basis` and `Custom Model Boundary` sections from the report page. The underlying model can remain responsible and evidence-informed in code; the user does not want those two cards displayed in the report.
3. Rename `Appearance Analysis` to `Pet Identification` (Chinese concept: `爱宠鉴定`). Remove the visible `Photo Quality` score and issues from this report section.
4. Add a polished disclaimer at the very end of the report. Recommended English copy:

   **Important notice**

   This service provides reference-only breed and appearance identification. It does not verify an animal's origin, ownership, breeding history, or the legality of keeping, rehoming, or trading the animal. Please comply with all applicable laws and animal-welfare requirements and make responsible decisions that respect life.

   Never abandon a pet. Every companion animal deserves a safe, stable, and caring home for life.

   Health and care content is general educational information about feeding, husbandry, and everyday wellness. It is not a veterinary diagnosis, consultation, prescription, or treatment plan and cannot replace an in-person examination by a qualified veterinarian. Seek veterinary care promptly if a pet is unwell, injured, or shows sudden physical or behavioral changes.

Compatibility requirement: old saved result rows may contain shorter report JSON. Generate or enrich the displayed report from the current deterministic model so old records still render safely. Avoid a database migration just for richer prose.

## Visual Identification

Provider: Qwen-VL through Alibaba DashScope. OpenAI is no longer used for this feature.

Relevant files:

- `app/api/visual-profile/route.ts`
- `lib/visualProfile.ts`
- `app/upload/page.tsx`
- `supabase/pet-visual-profiles.sql`

Environment variables:

```text
VISUAL_MODEL_PROVIDER=qwen
DASHSCOPE_API_KEY=<server-side secret>
QWEN_MODEL=qwen-vl-plus
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

Never expose `DASHSCOPE_API_KEY` through a `NEXT_PUBLIC_` variable.

User-facing requirements:

- Upload exactly three guided views: front, left, and right.
- Warn that incomplete or unclear photos may affect identification and test results.
- Compress large images before upload/display.
- Let the user see scanning/analysis activity before the next-step modal appears; the requested delay is about three seconds after all three photos are ready.
- Continue to the behavior test while background analysis finishes.
- Final report should describe cautious breed estimate, variety, possible mix, coat color/pattern/texture, face, eyes, ears, nose, and body structure.
- Use `Pet Identification`, not `Appearance Analysis`, in the report.
- Do not show the photo-quality score in the final report.

## Portrait Generation

Provider: Qwen image generation through DashScope.

Relevant files:

- `lib/portraitPrompts.ts` (36 style prompts and action directions)
- `app/api/portraits/route.ts`
- `app/api/portraits/asset/route.ts`
- `components/PortraitGenerator.tsx`
- `supabase/pet-portraits.sql`

Identity lock requirements:

- Keep species unchanged.
- Keep coat color and markings unchanged.
- Keep eye color unchanged.
- Preserve face shape, ears, nose, body type, sex, and age impression.
- Do not invent breed traits.
- Wardrobe, props, studio background, camera angle, and pose/action may change.
- Output should resemble a polished editorial pet photoshoot, not a simple background replacement.
- Each result receives three varied styles chosen from the built-in library.
- Add the pet name and a small PBTI logo after generation so the image model cannot distort typography.
- Portrait composition uses `public/pbti-logo-transparent.png`; do not add a white or translucent backing rectangle behind it.
- Render the pet name as a responsive wordmark with a bold outlined title, orange/white accent rule, and `PBTI PET PORTRAIT` subtitle rather than plain text.
- The single download action exports the composited pet name and logo as a PNG and is labeled `Download original`; the upstream unbranded asset is not offered for download.
- Image-to-image portrait generation is fixed at the provider's supported maximum of `2K`; do not override it with `4K` or claim mathematically lossless output if the upstream model compresses it.

Environment variables:

```text
DASHSCOPE_API_KEY=<server-side secret>
QWEN_IMAGE_MODEL=wan2.7-image
QWEN_IMAGE_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
QWEN_IMAGE_SIZE=2K
PBTI_PORTRAIT_BUCKET=pet-portraits
```

Desired persistence behavior that still needs verification/completion:

- Opening a report should automatically create the first three portraits if none exist; the user should not need to press Generate.
- Generated portraits must be saved in Supabase and reused every time the same report is opened.
- Account Center should show saved portraits with the correct pet name and pet association.
- Do not regenerate three new portraits on every report view.

## Authentication

Supabase Auth supports Google OAuth and email/password registration.

Known production URLs:

- Site: `https://pbti-pet-personality.pages.dev`
- Supabase project URL: `https://ppxgnlnfsgpqyftnbwnx.supabase.co`
- Google OAuth callback registered in Google Cloud: `https://ppxgnlnfsgpqyftnbwnx.supabase.co/auth/v1/callback`
- Supabase Site URL: `https://pbti-pet-personality.pages.dev`
- Supabase redirect allow-list: `https://pbti-pet-personality.pages.dev/auth/callback`
- Local redirect for development: `http://localhost:3000/auth/callback` or `http://127.0.0.1:3000/auth/callback` if added to the allow-list.

Relevant files:

- `lib/auth.ts`
- `app/auth/callback/route.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `components/HeaderAccountActions.tsx`

Security rules:

- Browser configuration must use the Supabase `sb_publishable_...` key.
- Never put an `sb_secret_...` key in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Never commit actual API keys.

Environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://pbti-pet-personality.pages.dev
NEXT_PUBLIC_SUPABASE_URL=https://ppxgnlnfsgpqyftnbwnx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sb_publishable key>
```

Historical login issue: Google login sometimes displayed a stale email or stayed on `Signing in...`. `lib/auth.ts` now signs out globally, clears Supabase browser cache/cookies, and requests Google account selection before OAuth. Re-test this flow after any auth changes.

## Supabase Data Ownership

Each signed-in user must only see and modify their own pets, answers, reports, visual profiles, and portraits. RLS policies are essential.

Primary tables:

- `users_profile`
- `pets`
- `personality_results`
- `pet_visual_profiles`
- `pet_portraits`
- `payments`

Important fields:

- `pets`: `user_id`, `name`, `species`, `breed`, `age`, `photo_url`, `photo_urls`
- `personality_results`: `user_id`, `pet_id`, `pbti_id`, `personality_type`, `scores`, `report`, `is_premium`
- `pet_portraits`: `pet_id`, `user_id`, style metadata, image/storage URL, model, prompt

SQL files for an existing Supabase project:

- `supabase/apply-permissions.sql`
- `supabase/personality-results-report-column.sql`
- `supabase/personality-results-user-id.sql`
- `supabase/pet-visual-profiles.sql`
- `supabase/pet-portraits.sql`

`supabase/schema.sql` is the consolidated reference. Run migration scripts in Supabase SQL Editor, not Cloudflare. After schema changes, use `notify pgrst, 'reload schema';` when needed.

Historical errors and causes:

- `permission denied for table pets`: grants or RLS policies missing.
- Missing `age` or `photo_url`: old `pets` schema.
- Missing `report` or `is_premium`: old `personality_results` schema.
- Null `personality_results.user_id`: ownership migration not applied or insert omitted the signed-in user.
- Different accounts seeing the same result: local/global state was being reused instead of querying by Supabase user ownership.

## Account Center

Route: `/account`.

Expected features:

- Show signed-in email.
- List pets and their matching species/type artwork.
- Open each report and memory entry.
- Show generated portrait posters with pet identity.
- Create additional pet profiles.
- Allow deleting a pet and its associated report after a clear confirmation step.

Deletion was requested but should be verified: current uncommitted `app/account/page.tsx` primarily adds species-aware personality artwork. Confirm that pet/report deletion is implemented end to end, respects RLS, and cascades related records/storage before calling it complete.

## Navigation and Language

Required navigation labels/concepts:

- Home
- Method / How it works
- Types
- Pricing
- Account

The main audience is overseas, so pages should default to English. Some current shared navigation text remains Chinese in `components/AppShell.tsx`; treat full English consistency as pending cleanup. Keep the language selector in the top-right and preserve the translation architecture.

## Deployment

Repository: `fuiet/pbti-pet-personality`

Production branch: `main`

Cloudflare Pages:

- Domain: `https://pbti-pet-personality.pages.dev`
- Output: `.vercel/output/static`
- `wrangler.toml` uses `nodejs_compat` and compatibility date `2025-08-01`.
- Existing build flow uses `@cloudflare/next-on-pages`, although it is deprecated in favor of OpenNext. Do not migrate adapters as part of an unrelated fix.

Historical Cloudflare build issues already handled:

- UTF-8 BOM in `package.json`.
- Non-UTF-8 source file.
- Supabase relation type mismatch.
- Missing `export const runtime = "edge"` on dynamic Cloudflare routes.

Never push or deploy automatically unless the user explicitly requests it. Local preview should be used first when practical.

## Local Development and Verification

Standard commands:

```powershell
npm run dev
npm run build
```

The bundled Node runtime may need to be called directly in this environment:

```powershell
& 'C:\Users\Administrator\AppData\Local\OpenAI\Codex\runtimes\cua_node\03b1cdac8af3a530\bin\node.exe' '.\node_modules\typescript\bin\tsc' --noEmit
& 'C:\Users\Administrator\AppData\Local\OpenAI\Codex\runtimes\cua_node\03b1cdac8af3a530\bin\node.exe' '.\node_modules\next\dist\bin\next' build
```

Before finishing a change:

1. Check `git diff` and preserve unrelated changes.
2. Run TypeScript validation.
3. Run a production build when the change affects routes, APIs, or shared components.
4. Test key UI behavior locally, especially auth, upload, quiz completion, report rendering, and portrait persistence.
5. Only commit/push/deploy when explicitly requested.

## Current Git State

Branch at handoff: `main`

HEAD at handoff: `2c8ed74 Show PBTI codes on homepage type cards`

Recent commits:

- `2c8ed74 Show PBTI codes on homepage type cards`
- `022a496 Add pet portrait generation and report updates`
- `ad21393 Open premium features for launch month`
- `c16b9fa Compress uploaded pet photos`
- `0842422 Add premium free access countdown`

Uncommitted files at handoff:

```text
M  app/account/page.tsx
M  app/api/portraits/route.ts
M  app/create/page.tsx
M  app/page.tsx
M  app/quiz/page.tsx
M  app/report/[id]/page.tsx
M  app/result/page.tsx
M  app/types/page.tsx
M  components/PortraitGenerator.tsx
?? app/api/portraits/asset/
?? data/personalityAssets.ts
?? public/assets/personalities/dogs/
```

These changes include species-aware Cat/Dog artwork, uploaded Dog assets, homepage alternation, report/account decoration, portrait download/logo composition work, and portrait asset proxying. They are user-requested work. Do not discard, reset, or overwrite them.

The current `components/PortraitGenerator.tsx` contains substantial interrupted work. Inspect its JSX and behavior carefully before further edits. In particular, verify compilation, automatic generation/persistence, composited logo/name downloads, and cleanup of generated object URLs.

## Pending Work Queue

Priority order unless the user gives a newer instruction:

1. Complete the report redesign described in `Latest Unfinished Report Task`.
2. Run TypeScript/build validation and fix any interrupted JSX or type errors without removing intended changes.
3. Finish and verify automatic portrait generation, persistence, reuse, pet association, original 2K download, and embedded logo/name.
4. Verify upload compression and the three-second analysis modal delay.
5. Implement and verify pet/report deletion in Account Center with confirmation and correct cascading behavior.
6. Re-test Google account switching and email registration.
7. Complete English-language consistency across shared navigation and screens.
8. Update the outdated `README.md`, which still incorrectly mentions a unified 16-type MVP and contains an encoding artifact.

## Non-Negotiable Constraints

- Do not regenerate the Cat or Dog personality images.
- Do not mix Cat and Dog artwork for a known species.
- Do not expose or commit secrets.
- Do not replace the 12 canonical names or four-letter codes.
- Do not claim medical, ancestry, behavioral, or statistical certainty that the system does not provide.
- Do not overwrite unrelated or uncommitted user changes.
- Do not push or deploy unless explicitly requested.

## 2026-07-20 Bilingual System Update

- The supported languages are English (default) and Simplified Chinese only.
- `components/LanguageProvider.tsx` owns the active language, persists it under `pbti-language`, detects Chinese browsers on first visit, and synchronizes the document `lang` attribute.
- Shared UI translations live in `lib/i18n.ts`; page-specific natural Chinese copy remains close to its page when it is substantial.
- `data/zhQuestions.ts` contains behavior-equivalent Simplified Chinese wording for all 28 scored questions. It changes display copy only; dimensions, values, IDs, and scoring are unchanged.
- Report generation accepts `language` and produces native Chinese report prose when `zh-CN` is active.
- Core journeys now respond to the language selector: home, authentication, profile creation, upload and visual analysis, quiz, result, full report, portraits, dashboard/account, type library, and memory book.
- English personality codes remain canonical. Chinese UI adds localized names and explanations without changing those codes.
- Production build passed locally after the bilingual implementation. These changes remain uncommitted and must not be pushed or deployed unless explicitly requested.
