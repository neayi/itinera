# Itinera Constitution

## Core Principles

### I. Docker-First Development
All development must be done through Docker containers, not directly with npm. This ensures consistent environments across development and production.
- Start application: `docker compose up`
- After adding npm packages: `docker compose build` then `docker compose up`
- Access application at: http://localhost:3000/
- Shell access: `docker compose exec itinera sh`

### II. SCSS for Styling
New components must use SCSS for styling, not plain CSS or Tailwind (except for existing shadcn/ui components).
- Place SCSS files alongside components
- Use SCSS variables for consistency
- Prefer component-scoped styles

### III. TypeScript Strict Typing
All code must be strictly typed in TypeScript.
- Type all props and state
- Use interfaces for data structures
- PascalCase for components, camelCase for variables
- No `any` types except for temporary API responses that need refactoring

### IV. Database-First for Data
All user data is stored in MySQL with JSON columns for complex structures.
- Systems of culture (rotations, interventions) are stored as JSON in `systems.json` column
- Interventions use key/value pairs in `values[]` arrays
- All edits must persist via PATCH API calls
- Use `reviewed` flag to track user-verified vs AI-predicted values

### V. Component Patterns
Follow established patterns for consistency:
- Editable cells: Click to edit, ✓ to save, ✕ to cancel
- Callbacks: `onUpdate` for data refresh after changes
- Formatting: Use `formatValue()` for numeric values with units
- State management: Props down, callbacks up

## Data Architecture

### JSON Structure for Systems
Agricultural systems are stored with this structure:
```json
{
  "steps": [{
    "id": "step1",
    "name": "Orge + Lupin",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-07-20T00:00:00.000Z",
    "interventions": [{
      "id": "uuid",
      "day": "0",
      "name": "Labour",
      "description": "...",
      "type": "intervention_top",
      "values": [
        {"key": "frequence", "value": 1, "reviewed": true},
        {"key": "azoteOrganique", "value": 25.5, "reviewed": false},
        {"key": "ges", "value": 0.062, "reviewed": "n/a"}
      ]
    }]
  }]
}
```

### Reviewed Status
- `true`: User has verified/edited the value
- `false` or `undefined`: AI-predicted value, needs review (display with yellow background)
- `"n/a"`: Field not applicable for this intervention (display as "-")

### Frequency Weighting
- Frequency represents intervention occurrence per year
- Default frequency is 1.0 if not specified
- Step totals are calculated by summing: `value × frequency` for each intervention
- Frequency itself is NOT totaled at step level

## Technology Stack

### Core Framework
- Next.js 16.1.1 (App Router)
- React 19
- TypeScript

### UI Libraries
- TanStack Table v8 for data tables
- shadcn/ui for UI components
- Lucide React for icons
- sass for SCSS compilation

### Database
- MySQL for persistent storage
- JSON columns for complex nested data

### Deployment
- Docker containerization
- docker-compose for orchestration

## Development Workflow

### API Routes Pattern
```
/api/[resource]/[id]/route.ts
```
Supported methods:
- GET: Retrieve data
- POST: Create
- PATCH: Update (for inline edits)
- DELETE: Remove

### Inline Editing Flow
1. User clicks cell → enters edit mode
2. User modifies value → clicks ✓
3. Component updates JSON with `reviewed: true`
4. PATCH request to `/api/systems/${id}`
5. `onUpdate` callback refreshes data
6. Table recalculates totals automatically

### Value Formatting
All numeric values displayed through `formatValue()`:
- Handles units (€, kg, h, kg CO2e, qtx)
- Applies rounding rules per field type
- Returns "-" for zero/null values

## Governance

### Non-Negotiables
- Docker for all development (no `npm run dev`)
- TypeScript strict mode
- Database persistence for all user changes
- SCSS for new component styles

### Code Review Checklist
- [ ] Docker build succeeds
- [ ] TypeScript compiles without errors
- [ ] PATCH endpoint updates database
- [ ] Totals recalculate after edits
- [ ] Reviewed status tracked correctly
- [ ] Yellow highlighting for unreviewed values

### Amendment Process
Constitution changes require:
1. Documentation in this file
2. Update of `.github/copilot-instructions.md` if needed
3. Git commit with clear rationale

**Version**: 1.0.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-01-12

