# PBTI Project Handoff

Last updated: 2026-07-15

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
- 10+ page deep report
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
