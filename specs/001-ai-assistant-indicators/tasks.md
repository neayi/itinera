# Tasks: Assistant IA pour calcul des indicateurs

**Input**: Design documents from `/specs/001-ai-assistant-indicators/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Feature Branch**: `001-ai-assistant-indicators`

**Tests**: Tests are OPTIONAL and not included in this task list as TDD was not explicitly requested in the specification.

**Organization**: Tasks are grouped by user story (US) from spec.md to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Add OpenAI SDK dependency via `npm install openai` and rebuild Docker with `docker compose build`
- [X] T002 [P] Create environment configuration in `.env.local` with OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TEMPERATURE, OPENAI_MAX_TOKENS, AI_ASSISTANT_ENABLED, AI_AUTO_CALCULATE, AI_MAX_CONVERSATIONS_LENGTH
- [X] T003 [P] Create AI types file `lib/ai/types.ts` with ConversationMessage, CalculationContext, CalculationResult, ConfidenceLevel interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create OpenAI client wrapper in `lib/ai/openai-client.ts` with callGPT function, error handling, and retry logic
- [X] T005 [P] Extend TypeScript types in `lib/types.ts` to add conversation?, confidence?, assumptions? fields to intervention values
- [X] T006 [P] Create base IndicatorCalculator class in `lib/ai/indicator-calculator.ts` with calculateIndicator, refineValue, calculateAllMissing methods (stubs)
- [X] T007 Create AI Assistant directory structure `components/ai-assistant/` with index.ts
- [X] T008 Extend PATCH `/app/api/systems/[id]/route.ts` to handle updated JSON structure with assumptions and conversation fields

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single Indicator Calculation (Priority: P1) 🎯 MVP

**Goal**: User can click "Calculate" on a single empty cell and get an AI-calculated value with explanation

**Independent Test**: Open a project with empty frequence values → Click cell → AI calculates frequence=1 with reasoning → Value appears with reviewed=false, conversation history saved

### Implementation for User Story 1

- [X] T009 [P] [US1] Create frequence prompt in `lib/ai/prompts/frequence.ts` with French instructions, context hierarchy reading, JSON output format
- [X] T010 [US1] Implement calculateIndicator method in `lib/ai/indicator-calculator.ts` for frequence indicator using OpenAI client and prompt
- [X] T011 [US1] Create POST `/app/api/ai/calculate-indicator/route.ts` endpoint with systemId, stepIndex, interventionIndex, indicatorKey request handling
- [X] T012 [US1] Add loading state to calculation in `components/interventions-table/EditableNumberCell.tsx`
- [X] T013 [US1] Add "Calculate" button trigger in `components/interventions-table/EditableNumberCell.tsx` for empty cells calling calculate-indicator endpoint
- [X] T014 [US1] Display calculated value with reviewed=false, confidence badge in `components/interventions-table/EditableNumberCell.tsx`
- [X] T015 [US1] Update formatters in `components/interventions-table/formatters.ts` to display confidence badge (🟢 high / 🟡 medium / 🔴 low) next to values

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - single indicator calculation working end-to-end

---

## Phase 4: User Story 2 - Conversation History Display (Priority: P2)

**Goal**: When user clicks a cell with calculation history, they can see the full conversation explaining how the value was calculated

**Independent Test**: Click a cell that was previously calculated → Side panel opens → Full conversation history displayed with system message, assistant reasoning, assumptions, sources → User can read through calculation steps

### Implementation for User Story 2

- [X] T016 [P] [US2] Create AIAssistant base component in `components/ai-assistant/AIAssistant.tsx` with isOpen, focusedCell, systemData, onValueUpdate props
- [X] T017 [P] [US2] Create ConversationHistory component in `components/ai-assistant/ConversationHistory.tsx` to display messages array with role-based styling
- [X] T018 [P] [US2] Create SCSS styles in `components/ai-assistant/ai-assistant.scss` for panel layout, message bubbles, confidence badges
- [X] T019 [US2] Integrate AIAssistant component into `components/pages/ProjectDetails.tsx` with state management for isOpen and focusedCell
- [X] T020 [US2] Modify `components/interventions-table/EditableNumberCell.tsx` to auto-open AIAssistant on cell click, passing cell context
- [X] T021 [US2] Add conversation retrieval logic to AIAssistant to extract conversation from systemData.steps[stepIndex].interventions[interventionIndex].values[key].conversation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can calculate values and view their calculation history

---

## Phase 5: User Story 3 - Value Refinement via Dialogue (Priority: P3)

**Goal**: User can ask questions about a calculated value and refine it through conversation with the AI

**Independent Test**: Open cell with calculation → Ask "What machine did you assume?" → AI responds with machine details → User says "I use 120 CV tractor not 150" → AI recalculates with new assumption → New value displayed → Conversation updated with refinement

### Implementation for User Story 3

- [X] T022 [P] [US3] Create MessageInput component in `components/ai-assistant/MessageInput.tsx` with text input, send button, loading state
- [X] T023 [US3] Implement refineValue method in `lib/ai/indicator-calculator.ts` to append user message and call OpenAI with full conversation history
- [X] T024 [US3] Create POST `/app/api/ai/refine-value/route.ts` endpoint accepting systemId, stepIndex, interventionIndex, indicatorKey, userMessage
- [X] T025 [US3] Integrate MessageInput into AIAssistant component with onSend handler calling refine-value endpoint
- [X] T026 [US3] Handle refined value response by updating systemData and refreshing conversation display in AIAssistant
- [X] T027 [US3] Add automatic conversation persistence via PATCH `/app/api/systems/[id]/route.ts` after refinement
- [X] T028 [US3] Handle manual value edits in EditableNumberCell by adding user message to conversation with "action: manual_edit" and reviewed=true

**Checkpoint**: All three core user stories should now be independently functional - calculate, view history, refine via dialogue

---

## Phase 6: User Story 4 - Hierarchical Assumptions Management (Priority: P4)

**Goal**: AI reads and updates assumptions in markdown format at 3 levels (system/step/intervention) with cascade logic and conflict detection

**Independent Test**: Set system-level assumption "Agriculture biologique" → Calculate fertilizer cost → AI detects bio context and restricts to organic products → Adds intervention-level assumption "Engrais bio uniquement" → No duplication at intervention level of system-wide bio status

### Implementation for User Story 4

- [X] T029 [P] [US4] Create AssumptionsPanel component in `components/ai-assistant/AssumptionsPanel.tsx` with 3 collapsible sections (System/Step/Intervention)
- [X] T030 [P] [US4] Add markdown parser utility in `lib/ai/assumptions-parser.ts` to read and extract assumptions from markdown text
- [X] T031 [US4] Update all prompts in `lib/ai/prompts/` to include system assumptions, step assumptions, intervention assumptions in context section
- [X] T032 [US4] Modify calculateIndicator and refineValue in `lib/ai/indicator-calculator.ts` to read 3-level assumptions hierarchy before calculation
- [X] T033 [US4] Add assumption level detection logic to IndicatorCalculator to determine appropriate storage level (system/step/intervention)
- [X] T034 [US4] Update PATCH endpoint in `/app/api/systems/[id]/route.ts` to handle assumptions markdown updates at all 3 levels
- [X] T035 [US4] Integrate AssumptionsPanel into AIAssistant component showing current assumptions context for focused cell
- [X] T036 [US4] Add conflict detection in IndicatorCalculator to identify contradictions between assumption levels and warn user

**Checkpoint**: Assumptions management working - AI uses hierarchical context and updates markdown appropriately

---

## Phase 7: User Story 5 - Additional Core Indicators (Priority: P5)

**Goal**: Extend calculation support to 5 more core indicators beyond frequence: temps-travail, ges, azote-mineral, azote-organique, rendement

**Independent Test**: Calculate temps-travail for "Labour" intervention → AI calculates based on machine width and speed → Calculate GES based on GNR consumption → Calculate azote values based on fertilizer type → Calculate rendement based on crop type and bio/conventional context

### Implementation for User Story 5

- [X] T037 [P] [US5] Create temps-travail prompt in `lib/ai/prompts/temps-travail.ts` with machine assumptions and calculation formula
- [X] T038 [P] [US5] Create ges prompt in `lib/ai/prompts/ges.ts` using GNR × 3.15 kg CO2e/L formula
- [X] T039 [P] [US5] Create azote-mineral prompt in `lib/ai/prompts/azote-mineral.ts` with fertilizer type detection and quantity calculation
- [X] T040 [P] [US5] Create azote-organique prompt in `lib/ai/prompts/azote-organique.ts` with organic fertilizer detection
- [X] T041 [P] [US5] Create rendement prompt in `lib/ai/prompts/rendement.ts` with crop type, bio/conventional context, regional averages
- [X] T042 [US5] Extend calculateIndicator in `lib/ai/indicator-calculator.ts` to route these 5 new indicator types to appropriate prompts
- [X] T043 [US5] Add indicator-specific validation rules to each prompt (N/A conditions, value ranges, unit handling)

**Checkpoint**: Six indicators now calculable (frequence + 5 new) with full conversation support

---

## Phase 8: User Story 6 - Cost Indicators (Priority: P6)

**Goal**: Calculate cost-based indicators using AI knowledge of average French agricultural prices: couts-phytos, semences, engrais, mecanisation, gnr, irrigation

**Independent Test**: Calculate mecanisation cost for labour operation → AI proposes 130 €/ha based on machine type → User refines with "I use 4-furrow plow not 5" → AI recalculates → Calculate semences cost → AI proposes price based on crop type and bio/conventional → User accepts or refines with actual price

### Implementation for User Story 6

- [ ] T044 [P] [US6] Create couts-phytos prompt in `lib/ai/prompts/couts-phytos.ts` with product identification and average price estimation
- [ ] T045 [P] [US6] Create semences prompt in `lib/ai/prompts/semences.ts` with crop variety, density, bio factor, average price
- [ ] T046 [P] [US6] Create engrais prompt in `lib/ai/prompts/engrais.ts` with fertilizer type, formulation, quantity, average price
- [ ] T047 [P] [US6] Create mecanisation prompt in `lib/ai/prompts/mecanisation.ts` with operation type, machine size, amortization calculation
- [ ] T048 [P] [US6] Create gnr prompt in `lib/ai/prompts/gnr.ts` with fuel consumption calculation and price (default 1.10 €/L)
- [ ] T049 [P] [US6] Create irrigation prompt in `lib/ai/prompts/irrigation.ts` with water volume, system type, cost/m³
- [ ] T050 [US6] Extend calculateIndicator routing to handle all 6 cost indicator types
- [ ] T051 [US6] Add cost-specific formatting to `components/interventions-table/formatters.ts` for euro values with confidence badges

**Checkpoint**: All cost indicators calculable with AI-estimated average prices refinable via dialogue

---

## Phase 9: User Story 7 - Technical Indicators (Priority: P7)

**Goal**: Calculate technical indicators that require agricultural expertise: ift, eiq, prix-vente using AI knowledge of French agriculture

**Independent Test**: Calculate IFT for herbicide application → AI identifies product from description and estimates IFT based on dose → Calculate EIQ based on active ingredients → Calculate prix-vente for wheat harvest considering bio/conventional and quality

### Implementation for User Story 7

- [ ] T052 [P] [US7] Create ift prompt in `lib/ai/prompts/ift.ts` with product identification, dose analysis, IFT estimation from AI knowledge
- [ ] T053 [P] [US7] Create eiq prompt in `lib/ai/prompts/eiq.ts` with active ingredient extraction, EIQ calculation logic
- [ ] T054 [P] [US7] Create prix-vente prompt in `lib/ai/prompts/prix-vente.ts` with crop type, quality factors, bio premium, market averages
- [ ] T055 [US7] Extend calculateIndicator routing for IFT, EIQ, prix-vente indicators
- [ ] T056 [US7] Add special N/A handling for prix-vente (only for harvest/moisson/fauche interventions) in indicator-calculator.ts
- [ ] T057 [US7] Add validation for IFT/EIQ to mark low confidence when product details are vague

**Checkpoint**: All 15 indicators now supported - feature complete for individual calculations

---

## Phase 10: User Story 8 - Batch Calculation (Priority: P8)

**Goal**: User can calculate all missing values in a rotation with a single action, with progress tracking

**Independent Test**: Open project with 20 empty cells → Click "Calculate All Missing" → Progress bar shows 0/20 → Calculations run in batches of 5 parallel → Progress updates 5/20, 10/20, etc. → All cells filled with reviewed=false → Summary shows which indicators were calculated

### Implementation for User Story 8

- [ ] T058 [P] [US8] Create CalculationProgress component in `components/ai-assistant/CalculationProgress.tsx` with progress bar, current/total, cancel button
- [ ] T059 [US8] Implement calculateAllMissing method in `lib/ai/indicator-calculator.ts` with parallel batch logic (5 concurrent max), reviewed=false detection
- [ ] T060 [US8] Create POST `/app/api/ai/calculate-all-missing/route.ts` endpoint with systemId, returns calculatedCount, summary array
- [ ] T061 [US8] Add "Calculate All Missing" button to ProjectDetails toolbar calling calculate-all-missing endpoint
- [ ] T062 [US8] Integrate CalculationProgress component into AIAssistant to show batch progress with WebSocket or polling
- [ ] T063 [US8] Add summary display after batch completion showing which indicators calculated, confidence levels, any failures
- [ ] T064 [US8] Implement cancellation logic to abort in-progress batch calculation

**Checkpoint**: Batch calculation working - users can fill entire rotations quickly

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T065 [P] Add error boundary component to `components/ai-assistant/AIAssistant.tsx` for graceful OpenAI API failure handling
- [ ] T066 [P] Add loading skeletons to ConversationHistory and CalculationProgress components
- [ ] T067 [P] Implement conversation length pruning (max 10 exchanges) with summarization in `lib/ai/indicator-calculator.ts`
- [ ] T068 [P] Add comprehensive French error messages for all API endpoints with user-friendly explanations
- [ ] T069 Add undo/redo functionality for batch calculations in ProjectDetails state management
- [ ] T070 Implement confidence badge color coding consistently across EditableNumberCell, ConversationHistory, CalculationProgress
- [ ] T071 [P] Add telemetry logging for calculation events (indicator type, confidence, refinement count) in all API endpoints
- [ ] T072 [P] Create user documentation in `docs/ai-assistant-guide.md` with screenshots and examples
- [ ] T073 Add accessibility improvements (ARIA labels, keyboard navigation) to AIAssistant components
- [ ] T074 Optimize JSON payload size by compressing old conversation messages in PATCH endpoint
- [ ] T075 Add performance monitoring for OpenAI API calls with timeout warnings in openai-client.ts
- [ ] T076 Run quickstart.md validation with all 15 indicators on real project data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories ✅ MVP
  - US2 (Phase 4): Depends on US1 for calculate endpoint to exist, but independently testable
  - US3 (Phase 5): Depends on US1 + US2 for calculation and display infrastructure
  - US4 (Phase 6): Independent of US3, can start after Foundational
  - US5 (Phase 7): Depends on US1 architecture, extends with more indicators
  - US6 (Phase 8): Depends on US1 architecture, adds cost indicators
  - US7 (Phase 9): Depends on US1 architecture, adds technical indicators
  - US8 (Phase 10): Depends on US1-7 for all indicator types to be available
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundational (Phase 2)
    ↓
    ├─→ US1 (Phase 3): Single Indicator - MVP ⭐
    │       ↓
    │       ├─→ US2 (Phase 4): Conversation Display
    │       │       ↓
    │       │       └─→ US3 (Phase 5): Refinement Dialogue
    │       │
    │       ├─→ US4 (Phase 6): Assumptions Hierarchy (independent of US2/US3)
    │       │
    │       ├─→ US5 (Phase 7): Core Indicators Extension
    │       │
    │       ├─→ US6 (Phase 8): Cost Indicators Extension
    │       │
    │       └─→ US7 (Phase 9): Technical Indicators Extension
    │
    └─→ US8 (Phase 10): Batch Calculation (needs US1-7 complete)
            ↓
        Polish (Phase 11)
```

### Parallel Opportunities

- **Setup Phase**: T001, T002, T003 can all run in parallel
- **Foundational Phase**: T005, T006, T007 can run in parallel after T004
- **US1**: T009 and T012-T015 can run in parallel after T010-T011
- **US2**: T016, T017, T018 can run in parallel
- **US4**: T029, T030 can run in parallel
- **US5**: T037-T041 (all 5 prompts) can run in parallel
- **US6**: T044-T049 (all 6 prompts) can run in parallel
- **US7**: T052-T054 (all 3 prompts) can run in parallel
- **US8**: T058 and T061-T063 can run in parallel after T059-T060
- **Polish Phase**: Most tasks (T065-T068, T071-T072, T073, T075) can run in parallel

---

## Parallel Example: User Story 5

```bash
# Launch all prompt files for User Story 5 together:
Task T037: "Create temps-travail prompt in lib/ai/prompts/temps-travail.ts"
Task T038: "Create ges prompt in lib/ai/prompts/ges.ts"
Task T039: "Create azote-mineral prompt in lib/ai/prompts/azote-mineral.ts"
Task T040: "Create azote-organique prompt in lib/ai/prompts/azote-organique.ts"
Task T041: "Create rendement prompt in lib/ai/prompts/rendement.ts"

# These can all be developed simultaneously by different team members
# or completed sequentially with copy/paste/modify pattern
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - ~6-8 hours)

1. Complete Phase 1: Setup (15 minutes)
2. Complete Phase 2: Foundational (1-2 hours)
3. Complete Phase 3: User Story 1 - Single Indicator (3-4 hours)
4. **STOP and VALIDATE**: Test frequence calculation end-to-end
5. Demo to stakeholders before continuing

**Why this MVP**: 
- Proves OpenAI integration works
- Validates conversation storage in JSON
- Tests full flow: click → calculate → display → save
- Single indicator (frequence) is simplest - no external data needed
- Delivers immediate value - users can start using AI for frequence

### Incremental Delivery (Recommended Path)

1. **Week 1**: Setup + Foundational + US1 → Deploy MVP
   - Users can calculate frequence with AI
   - Test with real users, gather feedback

2. **Week 2**: US2 + US3 → Deploy conversation features
   - Users can view calculation history
   - Users can refine values via dialogue
   - Core interaction pattern complete

3. **Week 3**: US4 + US5 → Deploy assumptions + 5 more indicators
   - Hierarchical context working
   - 6 total indicators (frequence, temps-travail, ges, azotes, rendement)

4. **Week 4**: US6 + US7 → Deploy all 15 indicators
   - Complete indicator coverage
   - Cost and technical indicators available

5. **Week 5**: US8 + Polish → Deploy batch calculation
   - Full feature complete
   - Production-ready polish

### Parallel Team Strategy

With 3 developers:

1. **All together**: Complete Setup + Foundational (1 day)
2. **Once Foundational is done**:
   - Developer A: US1 → US2 → US3 (interaction flow)
   - Developer B: US4 → US5 (assumptions + core indicators)
   - Developer C: US6 → US7 (cost + technical indicators)
3. **Merge and integrate**: US8 batch calculation (1 developer, needs all indicators)
4. **All together**: Polish phase

**Total Timeline**: 3-4 weeks with 3 developers, 4-5 weeks with solo developer

---

## Testing Checklist (Manual Validation)

**After US1 (MVP)**:
- [ ] Empty frequence cell displays "Calculate" button
- [ ] Click Calculate → Loading spinner → Value appears
- [ ] Value has confidence badge (🟡 medium expected)
- [ ] reviewed=false (yellow background)
- [ ] Conversation saved in JSON (verify in DB)

**After US2**:
- [ ] Click calculated cell → AIAssistant panel opens
- [ ] Conversation history displays with system + assistant messages
- [ ] Assumptions, sources, calculation steps visible
- [ ] Close panel → Cell still shows calculated value

**After US3**:
- [ ] Type message in AIAssistant → Send
- [ ] AI responds with refinement
- [ ] Value updates if recalculated
- [ ] Conversation grows with user/assistant messages
- [ ] Manual edit in cell adds message to conversation

**After US4**:
- [ ] System assumptions visible in AssumptionsPanel
- [ ] Step assumptions shown for focused cell's step
- [ ] Intervention assumptions shown for focused cell
- [ ] AI calculation references all 3 levels in reasoning

**After US5**:
- [ ] All 6 indicators calculable (frequence, temps-travail, ges, azote-mineral, azote-organique, rendement)
- [ ] Each uses appropriate assumptions from context
- [ ] N/A logic works (e.g., azote for non-fertilizer intervention)

**After US6**:
- [ ] All cost indicators calculate with €/ha values
- [ ] Prices are reasonable for French agriculture
- [ ] User can refine with "my actual price is X"
- [ ] AI updates calculation with corrected price

**After US7**:
- [ ] IFT calculates from product names in description
- [ ] EIQ calculates from active ingredients
- [ ] Prix-vente only calculates for harvest interventions
- [ ] All 15 indicators working

**After US8**:
- [ ] "Calculate All Missing" button appears
- [ ] Progress bar shows during batch calculation
- [ ] Calculations run in parallel (5 at a time)
- [ ] Summary displays after completion
- [ ] Can cancel mid-calculation

**After Polish**:
- [ ] Error messages in French and helpful
- [ ] OpenAI API failure shows graceful fallback
- [ ] Conversation pruning works (max 10 exchanges)
- [ ] Performance acceptable (<5s per indicator)
- [ ] Documentation complete

---

## Notes

- **[P] tasks** = different files, no dependencies, can parallelize
- **[Story] label** maps task to specific user story for traceability
- **Each user story** should be independently completable and testable
- **No tests included** - TDD not requested in specification, manual testing sufficient for MVP
- **Commit frequently** after each task or logical group
- **Stop at checkpoints** to validate story independently before proceeding
- **Avoid** same-file conflicts when parallelizing
- **MVP is US1 only** - validate approach before building full 15-indicator suite
- **French language** throughout - prompts, conversations, error messages, documentation

---

## Total Task Count

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 5 tasks (CRITICAL - blocks everything)
- **Phase 3 (US1 - MVP)**: 7 tasks ⭐
- **Phase 4 (US2)**: 6 tasks
- **Phase 5 (US3)**: 7 tasks
- **Phase 6 (US4)**: 8 tasks
- **Phase 7 (US5)**: 7 tasks
- **Phase 8 (US6)**: 8 tasks
- **Phase 9 (US7)**: 6 tasks
- **Phase 10 (US8)**: 7 tasks
- **Phase 11 (Polish)**: 12 tasks

**Total: 76 tasks**

**MVP Scope (Phases 1-3)**: 15 tasks (~6-8 hours)
**Full Feature**: 76 tasks (~4-5 weeks solo, ~3-4 weeks with team)

**Parallel Opportunities**: 35 tasks marked [P] can be parallelized
**Independent Stories**: US1 (MVP), US4, US5, US6, US7 can start independently after Foundational phase
