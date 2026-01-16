# Tasks: Règles de calcul des indicateurs et ergonomie du tableau

**Input**: Design documents from `/specs/003-indicators-ergonomics-rules/`  
**Prerequisites**: plan.md ✅, spec.md ✅, analysis.md ✅

**Tests**: Not explicitly requested in spec - tasks focus on implementation and manual testing scenarios

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Web app structure**: 
- Frontend: `components/`, `lib/`, `app/`
- Backend API: `app/api/`
- Database: MySQL JSON column

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed - project infrastructure already exists

**Status**: ✅ Complete - Next.js 16.1.2 project with all dependencies installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calculation architecture that MUST be complete before user stories

**Status**: ✅ Complete (2026-01-16)

**Completed work**:
- ✅ 4-level calculation architecture (intervention → step → system → indicators)
- ✅ `lib/calculate-system-totals.ts` - Pure calculation function
- ✅ `lib/persist-system.ts` - DB persistence (server-only)
- ✅ `lib/hooks/useDebouncedSave.ts` - 10-second debounce
- ✅ Client-side calculations with instant UI updates
- ✅ Async AI Assistant opening (no blocking)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visualiser l'état des cellules (Priority: P1) 🎯

**Goal**: Visual status indicators for cells so users can identify value source (AI, calculated, manual, n/a)

**Independent Test**: Open a system with varied interventions and verify color codes match status (white=non-calculated/user/calculated, light blue=AI high confidence, yellow=AI medium/low, gray=n/a)

**Current Status**: ~40% complete
- ✅ Status field ('user', 'calculated') implemented
- ✅ SystemIndicators shows pre-calculated values
- ❌ Missing: 'ia' and 'n/a' status values
- ❌ Missing: CSS color codes based on status

### Implementation for User Story 1

- [x] T001 [P] [US1] Add 'ia' status support to ValueStatus type in lib/types.ts
- [x] T002 [P] [US1] Add 'n/a' status support to ValueStatus type in lib/types.ts
- [x] T003 [US1] Update calculate-system-totals.ts to preserve 'ia' status from AI calculations
- [x] T004 [US1] Update calculate-system-totals.ts to set 'n/a' status for not-applicable values
- [x] T005 [P] [US1] Create CSS classes for status colors in components/interventions-table/interventions-table.scss:
  - `.status-na` → gris (#f3f4f6)
  - `.status-ia-high` → bleu clair (#dbeafe)
  - `.status-ia-medium` → jaune (#fef3c7)
  - `.status-ia-low` → jaune (#fef3c7)
- [x] T006 [US1] Implement getCellClassName() function in components/interventions-table/EditableNumberCell.tsx to return CSS class based on status + confidence
- [x] T007 [US1] Apply status CSS classes to cell wrapper div in EditableNumberCell.tsx
- [x] T008 [P] [US1] Apply same status classes to EditableDateCell.tsx
- [x] T009 [P] [US1] Apply same status classes to EditableStepValueCell.tsx
- [x] T010 [P] [US1] Apply same status classes to EditableTextAreaCell.tsx
- [x] T011 [P] [US1] Apply same status classes to EditableTextCell.tsx
- [x] T012 [US1] Manual test: Verify all 5 acceptance scenarios from spec.md User Story 1 (see TESTING-US1.md)

**Checkpoint**: Visual status indicators working - users can distinguish value sources

---

## Phase 4: User Story 2 - Éditer une cellule d'intervention (Priority: P1)

**Goal**: Enable cell editing with cascade calculations and instant UI feedback

**Independent Test**: Click on a "ges" cell in an intervention, modify value, validate, verify step totals and system indicators update automatically

**Current Status**: ✅ 95% complete
- ✅ Click to edit implemented
- ✅ Status='user' and reviewed=true on save
- ✅ Cascade calculations (intervention → step → system → indicators)
- ✅ Client-side calculations (no server round-trip)
- ✅ Debounced saves (10 seconds)
- ✅ Async AI Assistant opening
- ⚠️ Missing: Full integration with AI status values

### Implementation for User Story 2

- [ ] T013 [US2] Verify EditableNumberCell.tsx properly sets conversation history when user edits AI value
- [ ] T014 [US2] Verify calculateSystemTotals() preserves status='ia' for AI-calculated values not modified by user
- [ ] T015 [US2] Manual test: Verify all 5 acceptance scenarios from spec.md User Story 2

**Checkpoint**: Cell editing with cascade calculations working - instant UI updates

---

## Phase 5: User Story 3 - Pondération par fréquence (Priority: P1)

**Goal**: Automatic frequency weighting in step totals (intervention value × frequency)

**Independent Test**: Create intervention with frequency=2, input ges=50, verify step total includes 100 (50×2)

**Current Status**: ✅ 100% complete
- ✅ Frequency weighting implemented in calculate-system-totals.ts
- ✅ Default frequency=1 if missing
- ✅ Frequency=0 excluded from totals (FR-016a)
- ✅ Decimal frequencies supported (0<f<1)

### Validation for User Story 3

- [ ] T016 [US3] Manual test: Verify all 3 acceptance scenarios from spec.md User Story 3
- [ ] T017 [US3] Edge case test: Verify frequency=0 excludes intervention from totals
- [ ] T018 [US3] Edge case test: Verify frequency=0.5 (one year out of two) works correctly

**Checkpoint**: Frequency weighting working correctly - all edge cases handled

---

## Phase 6: User Story 4 - Forcer totalProduits (Priority: P2)

**Goal**: Manual override of totalProduits at step level, disabling automatic calculation

**Independent Test**: Edit totalProduits at step level, input value, verify it stays fixed even if prixVente or rendementTMS change

**Current Status**: ✅ 90% complete
- ✅ Manual override logic implemented in calculate-system-totals.ts (lines 155-172)
- ✅ Status='user' prevents automatic recalculation
- ⚠️ Missing: UI for editing totalProduits at step level

### Implementation for User Story 4

- [ ] T019 [US4] Verify EditableStepValueCell.tsx can edit totalProduits field at step level
- [ ] T020 [US4] Manual test: Verify all 4 acceptance scenarios from spec.md User Story 4
- [ ] T021 [US4] Edge case test: Verify resetting totalProduits to zero re-enables automatic calculation

**Checkpoint**: Manual totalProduits override working - automatic calculation properly disabled

---

## Phase 7: User Story 5 - Éditer indicateurs au niveau étape (Priority: P2)

**Goal**: Edit step-level indicators (semences, irrigation) that override intervention sums

**Independent Test**: Modify "semences" value at step level and verify it replaces weighted sum from interventions

**Current Status**: ⚠️ 60% complete
- ✅ EditableStepValueCell.tsx component exists
- ✅ Calculation logic supports step-level overrides
- ❌ Missing: Full integration for all step-level indicators
- ❌ Missing: Priority logic (step value > interventions sum)

### Implementation for User Story 5

- [ ] T022 [P] [US5] Verify EditableStepValueCell.tsx supports semences editing
- [ ] T023 [P] [US5] Verify EditableStepValueCell.tsx supports irrigation editing
- [ ] T024 [US5] Verify calculate-system-totals.ts prioritizes step.values over intervention sums
- [ ] T025 [US5] Manual test: Verify all 3 acceptance scenarios from spec.md User Story 5
- [ ] T026 [US5] Edge case test: Verify resetting step-level value to zero restores intervention sum

**Checkpoint**: Step-level indicator editing working - manual values override intervention sums

---

## Phase 8: AI Integration (Priority: P1) - Coordination with Spec 001

**Goal**: Integrate AI-calculated values with proper status tracking

**Dependencies**: Requires coordination with spec 001 (AI Assistant feature)

**Current Status**: ⚠️ Architecture ready, awaiting AI integration

### Implementation for AI Integration

- [ ] T027 [P] Coordinate with AI Assistant team on status='ia' field population
- [ ] T028 [P] Coordinate with AI Assistant team on confidence field usage
- [ ] T029 [P] Coordinate with AI Assistant team on conversation[] array structure
- [ ] T030 Verify AI-calculated values are stored with status='ia' in intervention.values
- [ ] T031 Verify AI confidence levels (high/medium/low) are properly set
- [ ] T032 Verify conversation history is appended when user edits AI value
- [ ] T033 Manual test: Click AI-calculated cell, verify assistant shows conversation history

**Checkpoint**: AI integration complete - status='ia' values properly tracked and displayed

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] T034 [P] Update plan.md "Implementation Status" section with completion dates
- [ ] T035 [P] Document color code mapping in components/interventions-table/README.md
- [ ] T036 [P] Add JSDoc comments to getCellClassName() function explaining status logic
- [ ] T037 Performance test: Verify calculations complete in <500ms with 50+ interventions per step (SC-002)
- [ ] T038 Consistency test: Verify systemIndicators always match step.values sums (SC-005)
- [ ] T039 Persistence test: Verify all calculated values saved in JSON at calculation time (SC-006)
- [ ] T040 Usability test: Verify users can identify cell status visually in <2 seconds (SC-001)
- [ ] T041 [P] Code review: Verify all status field usage follows spec conventions
- [ ] T042 [P] Code cleanup: Remove unused calculateTotals() code from components if any remains

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete
- **Foundational (Phase 2)**: ✅ Complete - architecture ready
- **User Story 1 (Phase 3)**: Can start immediately - foundation complete
- **User Story 2 (Phase 4)**: Can start immediately - foundation complete
- **User Story 3 (Phase 5)**: ✅ Complete - needs validation only
- **User Story 4 (Phase 6)**: Can start after US2 tested
- **User Story 5 (Phase 7)**: Can start after US2 tested
- **AI Integration (Phase 8)**: Can start in parallel, blocks US1 color codes completion
- **Polish (Phase 9)**: Depends on US1-US5 completion

### User Story Dependencies

- **User Story 1**: Independent - can start now
- **User Story 2**: Independent - can start now (mostly complete)
- **User Story 3**: ✅ Complete - independent validation needed
- **User Story 4**: Depends on US2 working (uses same editing infrastructure)
- **User Story 5**: Depends on US2 working (uses same editing infrastructure)

### Within Each User Story

**User Story 1** (Status visualization):
- CSS classes (T005) can be created in parallel with type updates (T001-T002)
- Type updates (T001-T002) must complete before calculate-system-totals update (T003-T004)
- getCellClassName function (T006) depends on CSS classes existing (T005)
- All EditableCell updates (T007-T011) can run in parallel once T006 complete
- Manual testing (T012) after all implementation complete

**User Story 2** (Cell editing):
- Tasks T013-T014 can run in parallel (different verification areas)
- Manual testing (T015) after verification complete

**User Story 4** (Force totalProduits):
- UI verification (T019) independent task
- Manual tests (T020-T021) after T019 complete

**User Story 5** (Step-level editing):
- Component checks (T022-T023) can run in parallel
- Logic verification (T024) independent
- Manual tests (T025-T026) after implementation verified

**AI Integration**:
- Coordination tasks (T027-T029) can run in parallel
- Implementation tasks (T030-T032) sequential
- Manual testing (T033) after implementation complete

### Parallel Opportunities

**Within User Story 1**:
```bash
# Parallel group 1: Types and CSS
Task T001: Add 'ia' status to ValueStatus type
Task T002: Add 'n/a' status to ValueStatus type
Task T005: Create CSS classes for status colors

# Parallel group 2: Apply to all cell types (after T006)
Task T007: Apply to EditableNumberCell
Task T008: Apply to EditableDateCell
Task T009: Apply to EditableStepValueCell
Task T010: Apply to EditableTextAreaCell
Task T011: Apply to EditableTextCell
```

**Across User Stories** (if team capacity allows):
```bash
# Developer A: User Story 1 (status visualization)
# Developer B: User Story 2 (verification)
# Developer C: User Story 4 + 5 (step-level editing)
# All can work in parallel - different files
```

---

## Implementation Strategy

### MVP First (Recommended)

**MVP = User Stories 1, 2, 3 working**

1. ✅ Foundation complete
2. Complete US1 (T001-T012) → Visual status indicators
3. Complete US2 validation (T013-T015) → Cell editing verified
4. ✅ US3 validation (T016-T018) → Frequency weighting verified
5. **STOP and DEMO**: Core functionality complete - users can:
   - See cell status visually
   - Edit cells with automatic calculations
   - Trust frequency weighting

### Incremental Delivery

1. ✅ Foundation → Calculations working
2. US1 → Status visualization → Demo color codes
3. US2 validation → Cell editing verified → Demo editing workflow
4. ✅ US3 validation → Frequency verified → Demo frequency scenarios
5. US4 → Manual totalProduits → Demo override capability
6. US5 → Step-level editing → Demo step overrides
7. AI Integration → Full AI status tracking → Demo AI workflow

### Parallel Team Strategy

With 3 developers:

1. ✅ Foundation complete (all developers)
2. **Week 1**:
   - Dev A: User Story 1 (T001-T012) - Status visualization
   - Dev B: User Story 2 validation (T013-T015) - Cell editing
   - Dev C: User Story 3 validation (T016-T018) - Frequency
3. **Week 2**:
   - Dev A: User Story 4 (T019-T021) - Force totalProduits
   - Dev B: User Story 5 (T022-T026) - Step-level editing
   - Dev C: AI coordination (T027-T029)
4. **Week 3**:
   - All: AI integration (T030-T033)
   - All: Polish (T034-T042)

---

## Task Summary

**Total Tasks**: 42

**By Phase**:
- Phase 1 (Setup): 0 tasks (complete)
- Phase 2 (Foundational): 0 tasks (complete)
- Phase 3 (US1): 12 tasks
- Phase 4 (US2): 3 tasks
- Phase 5 (US3): 3 tasks
- Phase 6 (US4): 3 tasks
- Phase 7 (US5): 5 tasks
- Phase 8 (AI Integration): 7 tasks
- Phase 9 (Polish): 9 tasks

**By Priority**:
- P1 (US1, US2, US3, AI): 28 tasks
- P2 (US4, US5): 8 tasks
- Polish: 9 tasks

**Parallel Opportunities**: 20 tasks marked [P] can run in parallel

**Estimated Effort**:
- US1 implementation: 6-8 hours
- US2 validation: 2 hours
- US3 validation: 2 hours
- US4 implementation: 3 hours
- US5 implementation: 4 hours
- AI integration: 6 hours (depends on spec 001)
- Polish: 4 hours
- **Total: ~27-31 hours**

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label maps task to user story for traceability
- Most architecture complete (2026-01-16) - remaining work is UI and integration
- AI integration (Phase 8) can proceed in parallel with user stories
- Each user story remains independently testable
- Manual test scenarios defined in spec.md acceptance criteria
- Success criteria (SC-001 to SC-006) to validate in Phase 9
