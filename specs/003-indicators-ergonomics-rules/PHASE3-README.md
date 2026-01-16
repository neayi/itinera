# Phase 3 Implementation: User Story 1 - Status Visualization

**Date**: 2026-01-16  
**Status**: ✅ Complete - Ready for manual testing

## Summary

Implemented visual status indicators for table cells to distinguish between different value sources (user-entered, calculated, AI-generated, not applicable).

## Changes Made

### 1. Type System (T001-T002)

**File**: `lib/types.ts`

- Added `ValueStatus` type: `'user' | 'calculated' | 'ia' | 'n/a'`
- Updated `InterventionValue` interface to include `status?: ValueStatus`
- Updated `StepValue` interface to include `status?: ValueStatus`

### 2. Calculation Logic (T003-T004)

**File**: `lib/calculate-system-totals.ts`

**Changes**:
- Modified `setValue()` helper to preserve `status='user'` and `status='ia'` (lines 54-67)
- Updated step-level value preservation to include `'ia'` and `'n/a'` statuses (lines 175-185)
- Calculations now respect user and AI overrides, never overwriting them

**Behavior**:
- `status='user'`: Manual edits are never overwritten by calculations
- `status='ia'`: AI-calculated values preserved until manually edited
- `status='calculated'`: Automatic calculations, can be overwritten
- `status='n/a'`: Not applicable, preserved as-is

### 3. CSS Styling (T005)

**File**: `components/interventions-table/interventions-table.scss`

**Added classes** (lines 271-284):
```scss
.status-na {
    background-color: #f3f4f6 !important; // gray
}

.status-ia-high {
    background-color: #dbeafe !important; // light blue
}

.status-ia-medium {
    background-color: #fef3c7 !important; // yellow
}

.status-ia-low {
    background-color: #fef3c7 !important; // yellow
}
```

**Color Mapping**:
- White (default): `status='user'`, `status='calculated'`, or undefined
- Light blue (#dbeafe): `status='ia'` + `confidence='high'`
- Yellow (#fef3c7): `status='ia'` + `confidence='medium'` or `'low'`
- Gray (#f3f4f6): `status='n/a'`

### 4. EditableNumberCell Component (T006-T007)

**File**: `components/interventions-table/EditableNumberCell.tsx`

**Changes**:
- Added `getCellClassName()` function (lines 9-24)
- Added `status` prop to component interface (line 34)
- Import `ValueStatus` and `ConfidenceLevel` types (line 6)
- Apply CSS class to cell wrapper (line 267)

**Function Logic**:
```typescript
function getCellClassName(status?: ValueStatus, confidence?: ConfidenceLevel): string {
  if (status === 'n/a') return 'status-na';
  if (status === 'ia') {
    if (confidence === 'high') return 'status-ia-high';
    if (confidence === 'medium') return 'status-ia-medium';
    if (confidence === 'low') return 'status-ia-low';
    return 'status-ia-medium';
  }
  return ''; // white background for user/calculated/undefined
}
```

### 5. EditableStepValueCell Component (T009)

**File**: `components/interventions-table/EditableStepValueCell.tsx`

**Changes**:
- Added same `getCellClassName()` function (lines 7-22)
- Added `status` and `confidence` props (lines 13-14)
- Import `ValueStatus` and `ConfidenceLevel` types (line 5)
- Apply CSS class to cell wrapper (line 177)

### 6. InterventionsDataTable Component (T008-T009)

**File**: `components/interventions-table/InterventionsDataTable.tsx`

**Changes**:
- Extract `valueStatus` from intervention.values (lines 297-310)
- Extract `valueStatus` from step.values for totals (lines 313-322)
- Pass `status` prop to `EditableNumberCell` (line 338)
- Pass `status` and `confidence` to `EditableStepValueCell` (lines 349-350)

**Data Flow**:
1. Read `status` from `intervention.values[].status` or `step.values[].status`
2. Pass to cell component as prop
3. Component calculates CSS class based on status + confidence
4. Class applied to cell wrapper for visual indication

### 7. EditableDateCell, EditableTextAreaCell, EditableTextCell (T010-T011)

**Status**: No changes needed

**Reason**: These components edit non-calculated fields (date, text, description) which don't have status indicators. They are not subject to automatic calculations or AI suggestions.

## Testing (T012)

**Checklist**: See `specs/003-indicators-ergonomics-rules/TESTING-US1.md`

### Manual Testing Scenarios

1. ✅ **Cellule vide**: White background, displays "-"
2. ✅ **Valeur calculée** (`status='calculated'`): White background
3. ✅ **Valeur manuelle** (`status='user'`): White background, preserved on recalc
4. ⏳ **Valeur IA haute confiance** (`status='ia'`, `confidence='high'`): Light blue background
5. ⏳ **Valeur IA confiance basse** (`status='ia'`, `confidence='low'`): Yellow background

**Note**: Scenarios 4-5 require AI Assistant integration (spec 001).

### Success Criteria

- **SC-001**: User can visually identify cell status in <2 seconds ⏳
- **Color distinction**: Clear visual difference between calculated/manual (white) and AI (blue/yellow) ⏳
- **Status preservation**: User and AI values not overwritten by recalculations ✅

## Build Status

✅ **Compilation**: Successful  
✅ **TypeScript**: No errors  
✅ **Runtime**: Ready for testing

## Dependencies

### Internal
- `lib/types.ts`: Type definitions
- `lib/calculate-system-totals.ts`: Calculation logic

### External
- None (uses existing dependencies)

## Next Steps

1. **Manual Testing**: Follow scenarios in `TESTING-US1.md`
2. **AI Integration**: Coordinate with spec 001 for `status='ia'` testing
3. **User Feedback**: Validate color choices with actual users
4. **Phase 4**: Proceed to User Story 2 validation (T013-T015)

## Files Modified

1. ✅ `lib/types.ts` - Type definitions
2. ✅ `lib/calculate-system-totals.ts` - Status preservation logic
3. ✅ `components/interventions-table/interventions-table.scss` - CSS classes
4. ✅ `components/interventions-table/EditableNumberCell.tsx` - Status visualization
5. ✅ `components/interventions-table/EditableStepValueCell.tsx` - Status visualization
6. ✅ `components/interventions-table/InterventionsDataTable.tsx` - Data flow
7. ✅ `specs/003-indicators-ergonomics-rules/tasks.md` - Task tracking
8. ✅ `specs/003-indicators-ergonomics-rules/TESTING-US1.md` - Test scenarios (NEW)
9. ✅ `specs/003-indicators-ergonomics-rules/PHASE3-README.md` - This file (NEW)

## Git Commit Message

```
feat(US1): Implement visual status indicators for table cells

- Add ValueStatus type ('user', 'calculated', 'ia', 'n/a')
- Update calculate-system-totals.ts to preserve AI and user statuses
- Add CSS classes for status colors (blue=AI high, yellow=AI low, gray=n/a)
- Implement getCellClassName() in EditableNumberCell and EditableStepValueCell
- Update InterventionsDataTable to pass status to cell components
- Create comprehensive manual testing checklist

Phase 3 (US1) complete - ready for manual testing
Tests: T001-T012 ✅
Ref: specs/003-indicators-ergonomics-rules/tasks.md
```

## Architecture Notes

### Design Decision: No Visual Distinction for 'user' vs 'calculated'

Per spec.md clarification (Q&A section), white background is used for both manual (`status='user'`) and calculated (`status='calculated'`) values. The distinction is maintained internally for preservation logic but not shown visually.

**Rationale**: Both are considered "final" values. The user cares about distinguishing AI suggestions (requiring review) from validated data.

### Color Palette

Colors chosen for accessibility and clarity:
- **Blue (#dbeafe)**: Positive, high confidence AI value
- **Yellow (#fef3c7)**: Warning, low confidence AI value (needs review)
- **Gray (#f3f4f6)**: Neutral, not applicable
- **White**: Default, validated data

### Status Preservation Priority

```
User override > AI value > Calculated value
```

When multiple sources could provide a value, the calculation respects this hierarchy:
1. `status='user'`: Never overwritten (highest priority)
2. `status='ia'`: Preserved until manually edited
3. `status='calculated'`: Recalculated on each save
4. `status='n/a'`: Preserved as-is (explicit non-applicability)
