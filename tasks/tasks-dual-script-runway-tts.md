## Relevant Files

- `newsreel-ai/lib/types.ts` - Contains type definitions for the API responses.
- `newsreel-ai/prompts/user/dual_script_generation_v1.0.md` - The new dual-script prompt for Gemini.
- `newsreel-ai/lib/prompts.ts` - Utility for loading prompts.
- `newsreel-ai/lib/gemini.ts` - Main Gemini integration file, needs `generateDualScriptAndSources`.
- `newsreel-ai/lib/runway.ts` - Main Runway integration file, needs TTS and polling logic.
- `newsreel-ai/app/api/generate/route.ts` - Main API route to update for returning instant scripts and polling video.
- `newsreel-ai/app/api/tts/route.ts` - New API route for handling TTS requests.
- `newsreel-ai/app/components/ScriptCard.tsx` - New component for displaying the readable script and listen button.
- `newsreel-ai/app/components/AudioPlayer.tsx` - New component for audio playback.
- `newsreel-ai/app/page.tsx` - Main layout needing updates for the new UI flow.

### Notes

- Environment variables (`.env.local`) will need updating before running locally.
- Keep the `Runway` video generation running asynchronously in the background.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Checkout branch `feature/dual-script-runway-tts`
- [x] 1.0 Update Prompts and Types
  - [x] 1.1 Update `GenerateNewsResponse` and add `TTSResponse`, `NewsSource` in `newsreel-ai/lib/types.ts`
  - [x] 1.2 Create the new prompt `newsreel-ai/prompts/user/dual_script_generation_v1.0.md`
  - [x] 1.3 Add logic to load the new prompt in `newsreel-ai/lib/prompts.ts`
- [x] 2.0 Update Gemini Integration
  - [x] 2.1 Implement `generateDualScriptAndSources` in `newsreel-ai/lib/gemini.ts` with JSON validation
- [x] 3.0 Add Runway TTS Integration
  - [x] 3.1 Implement `generateRunwayTTS` in `newsreel-ai/lib/runway.ts`
  - [x] 3.2 Implement `pollRunwayTTSStatus` in `newsreel-ai/lib/runway.ts`
- [x] 4.0 Update API Routes (`/api/generate` and `/api/tts`)
  - [x] 4.1 Modify `app/api/generate/route.ts` to return dual scripts instantly and kick off background video task
  - [x] 4.2 Create `app/api/tts/route.ts` to handle TTS generation and polling
- [x] 5.0 Update Frontend Components and UI
  - [x] 5.1 Create `app/components/ScriptCard.tsx`
  - [x] 5.2 Create `app/components/AudioPlayer.tsx`
  - [x] 5.3 Integrate new components and layout in `app/page.tsx`
