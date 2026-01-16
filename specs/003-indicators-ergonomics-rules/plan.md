# Implementation Plan: Règles de calcul des indicateurs et ergonomie du tableau

**Branch**: `003-indicators-ergonomics-rules` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-indicators-ergonomics-rules/spec.md`

## Summary

This feature specifies calculation rules for agricultural system indicators and improves table ergonomics. The primary requirement is to implement a 4-level calculation architecture (intervention → step → system → indicators) with visual status indicators, frequency weighting, and manual override capabilities. Technical approach: Client-side calculations using pure functions, debounced saves, and reactive UI updates without server round-trips.

## Technical Context

**Language/Version**: TypeScript with React 19, Next.js 16.1.2  
**Primary Dependencies**: 
- `@tanstack/react-table` v8 (table management)
- `lucide-react` v0.562.0 (icons including CloudCheck, CloudUpload)
- `calculateSystemTotals` (pure calculation function)
- `useDebouncedSave` (10-second save hook)

**Storage**: MySQL with JSON column for system data  
**Testing**: Manual testing scenarios defined in spec.md user stories  
**Target Platform**: Web application (browser)  
**Project Type**: Web application with client-side calculations  
**Performance Goals**: 
- Instant UI feedback (<50ms for edits)
- 10-second debounced saves to reduce server load
- No blocking operations during cell editing

**Constraints**: 
- All calculations must run client-side
- No server round-trips for totals calculation
- Preserve user-forced values (status='user')
- Support frequency weighting in step totals

**Scale/Scope**: 
- ~30 intervention indicators per system
- 5-10 steps per rotation
- 10-20 interventions per step
- Real-time calculation updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ Feature aligns with project goals (agricultural system management)  
✅ No breaking changes to existing APIs  
✅ Follows established patterns (pure functions, React hooks)  
✅ Performance requirements met (client-side calculations)  

## Project Structure

### Documentation (this feature)

```text
specs/003-indicators-ergonomics-rules/
├── plan.md              # This file
├── spec.md              # User stories and requirements (COMPLETE)
├── analysis.md          # Gap analysis and proposed tasks (COMPLETE)
└── checklists/
    └── requirements.md  # Quality validation (COMPLETE)
```

### Source Code (repository root)

```text
lib/
├── calculate-system-totals.ts       # Pure calculation function (4 levels)
├── persist-system.ts                 # DB save functions (server-only)
└── hooks/
    └── useDebouncedSave.ts          # 10-second debounce hook

components/
├── TopBar.tsx                        # Save status icons (CloudCheck/CloudUpload)
├── SystemIndicators.tsx              # Pre-calculated indicators display
├── interventions-table/
    ├── EditableNumberCell.tsx        # Async AI Assistant opening
    ├── EditableDateCell.tsx          # Cell editing components
    ├── EditableStepValueCell.tsx     # Step-level value editing
    └── formatters.ts                 # Value formatting utilities

app/api/systems/
├── [id]/route.ts                     # PATCH endpoint (save only)
└── calculate-step-totals/route.ts   # Legacy endpoint (backward compat)
```

## Implementation Status

### ✅ Completed (2026-01-16)

**Architecture - 3-level calculation system**
- ✅ Level 1: Intervention totals (totalProduits, totalCharges)
- ✅ Level 2: Step weighted sums (frequency × values)
- ✅ Level 3: System totals (sum across steps)
- ✅ Level 4: System indicators (per ha per year)
- ✅ Frequency=0 exclusion (FR-016a)
- ✅ Status field ('user', 'calculated')

**Client-side calculations**
- ✅ `calculateSystemTotals()` pure function (no DB access)
- ✅ Moved from server to client (EditableNumberCell)
- ✅ Separated persistence (`persist-system.ts`)
- ✅ No more server round-trips for calculations

**Debounced saves**
- ✅ `useDebouncedSave` hook (10-second delay)
- ✅ Save status tracking (saved/pending/saving/error)
- ✅ Visual feedback in TopBar (CloudCheck/CloudUpload icons)
- ✅ Async AI Assistant opening (no UI blocking)

**UI improvements**
- ✅ SystemIndicators reads pre-calculated values
- ✅ Removed runtime recalculation (~130 lines → 30 lines)
- ✅ Instant UI updates after edits

### ⏳ Remaining Work

**UI Status Indicators (User Story 1 - P1)**
- ❌ Color codes for cell status (FR-002)
  - Blanc: empty/user/calculated
  - Gris (#f3f4f6): status='n/a'
  - Bleu clair (#dbeafe): status='ia' && confidence='high'
  - Jaune (#fef3c7): status='ia' && confidence='medium'/'low'
- ❌ CSS classes for status styling
- ❌ Apply colors to EditableNumberCell

**Complete Status Field (P1)**
- ❌ 'ia' status (AI-calculated values)
- ❌ 'n/a' status (not applicable values)
- ❌ Integration with AI Assistant (spec 001)

**Step-level value editing (User Story 5 - P2)**
- ❌ EditableStepValueCell for semences, irrigation
- ❌ Manual override at step level
- ❌ Priority: step value > sum of interventions

**Testing & Validation (User Story 1-5)**
- ❌ Test frequency weighting scenarios
- ❌ Test manual totalProduits override
- ❌ Test step-level indicator editing
- ❌ Test status field preservation
- ❌ Test edge cases (frequency=0, zero values)

## Dependencies

### Internal (this repository)
- `lib/calculate-rotation-duration.ts` - Duration calculation for per-year indicators
- `components/ai-assistant/` - AI calculation integration (spec 001)
- MySQL JSON column structure - System data storage

### External (npm packages)
- All dependencies already installed
- lucide-react upgraded to v0.562.0 for CloudCheck icon

## Risks & Mitigation

**Risk**: Performance degradation with large systems (100+ interventions)  
**Mitigation**: Calculations are O(n) and run client-side, React batches updates automatically

**Risk**: Data loss during 10-second debounce window  
**Mitigation**: useDebouncedSave stores pending data in ref, force save on unmount

**Risk**: Conflict between client calculations and server data  
**Mitigation**: Single source of truth - client calculates, server only persists

## Next Steps

1. **Immediate (P1)**: Implement UI color codes for status field (FR-002)
   - Create CSS classes for each status/confidence combination
   - Update EditableNumberCell to apply classes
   - Test visual distinction

2. **Short-term (P1)**: Complete status field implementation
   - Add 'ia' status when AI calculates values
   - Add 'n/a' status for not-applicable indicators
   - Coordinate with spec 001 (AI Assistant)

3. **Medium-term (P2)**: Step-level value editing
   - Implement EditableStepValueCell component
   - Add manual override logic
   - Test priority: step value > interventions sum

4. **Testing**: Execute all acceptance scenarios from spec.md
   - User Story 1: Visual status verification
   - User Story 2: Edit and cascade calculations
   - User Story 3: Frequency weighting
   - User Story 4: Force totalProduits
   - User Story 5: Step-level editing

## Notes

- Major refactoring completed: calculate-step-totals.ts → calculate-system-totals.ts
- All calculation logic centralized and moved client-side
- Performance issue fixed: AI Assistant now opens asynchronously
- Backward compatibility maintained via alias exports
- Build passing, all files compile successfully
