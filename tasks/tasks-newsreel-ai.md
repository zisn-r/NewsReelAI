## Relevant Files

- `app/page.tsx` - Main landing page integrating all components.
- `app/api/generate/route.ts` - Main orchestrator API route.
- `lib/gemini.ts` - Gemini API wrapper.
- `lib/runway.ts` - Runway API wrapper.
- `lib/prompts.ts` - Prompt loading and formatting logic.
- `lib/types.ts` - TypeScript interfaces.
- `app/components/InputForm.tsx` - User input component.
- `app/components/LoadingState.tsx` - Loading UI component.
- `app/components/VideoPlayer.tsx` - Video display component.
- `app/components/SourcesCard.tsx` - Sources display component.
- `prompts/` - Directory containing all prompt markdown files.

### Notes

- Follow the implementation guides in `docs/stack_configuration.md` and `docs/PROMPT_INTEGRATION_QUICK_START.md`.
- Keep the scope restricted to the MVP as defined in `docs/project_prd.md`.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (`git checkout -b feature/newsreel-ai-mvp`)
- [x] 1.0 Project Setup & Foundation
  - [x] 1.1 Bootstrap the project using `create-next-app` (TypeScript, Tailwind, App Router) — created in `newsreel-ai/`
  - [x] 1.2 Install required dependencies: `@google/generative-ai`, `axios`, `dotenv`
  - [x] 1.3 Use `.env.local` file with `GEMINI_API_KEY` and `RUNWAY_API_KEY` — copied into `newsreel-ai/`
  - [x] 1.4 Define TypeScript interfaces in `lib/types.ts` (`NewsSource`, `GeminiResponse`, `RunwayTask`, `GenerateResult`, `GenerateError`)
- [x] 2.0 Prompt Engineering System Integration
  - [x] 2.1 Create the prompt engineering directory structure (`prompts/system`, `prompts/user`, `prompts/evals`)
  - [x] 2.2 Add system prompts to `prompts/system/` (`journalist_role_v1.0.md`, `video_script_optimization_v1.0.md`, `source_validation_v1.1.md`)
  - [x] 2.3 Add user workflows to `prompts/user/` (`news_to_script_v1.0.md`, `topic_validation_v1.0.md`)
  - [x] 2.4 Add configuration and eval files (`prompts/settings.json`, `prompts/test_cases.txt`, `prompts/changelog.md`)
  - [x] 2.5 Implement `lib/prompts.ts` to load prompt configurations and settings
- [x] 3.0 API Wrappers & Orchestrator
  - [x] 3.1 Implement `lib/gemini.ts` to handle topic validation and script generation using Gemini 2.5 Flash
  - [x] 3.2 Implement `lib/runway.ts` to handle Gen-4.5 text-to-video API requests and async polling
  - [x] 3.3 Create the main Next.js API orchestrator at `app/api/generate/route.ts` to sequence the API calls
- [x] 4.0 Frontend Components
  - [x] 4.1 Create `InputForm.tsx` for user topic input and submission
  - [x] 4.2 Create `LoadingState.tsx` to display spinners and progressing stages ("Researching...", "Generating video...")
  - [x] 4.3 Create `VideoPlayer.tsx` to render the final HTML5 `<video>` output
  - [x] 4.4 Create `SourcesCard.tsx` to display verified sources with titles, URLs, and authors
- [ ] 5.0 Main Application Integration & Deployment
  - [x] 5.1 Assemble the application layout and components in `app/page.tsx`
  - [x] 5.2 Add error handling state and user-friendly messages for timeout or API failures
  - [x] 5.3 Test the MVP workflow end-to-end (Topic Input -> API Orchestrator -> UI Display)
  - [ ] 5.4 Ensure the UI is polished with responsive Tailwind classes
  - [ ] 5.5 Setup Vercel deployment project and configure environment variables
