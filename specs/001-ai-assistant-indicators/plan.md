# Implementation Plan: Assistant IA pour calcul des indicateurs

**Branch**: `001-ai-assistant-indicators` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-assistant-indicators/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an AI-powered contextual assistant that calculates and refines agricultural intervention indicator values through dialogue. The assistant maintains conversation history per cell in JSON, uses specialized prompts per indicator type, and manages hierarchical assumptions (system/step/intervention levels) in markdown format. Core technical approach: OpenAI GPT-4o-mini for calculation with French-language prompts, scraping for external data (Ephy, prix agricoles) with future MCP migration, and JSON storage for conversations with optional DB migration if needed.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.1 (App Router), React 19  
**Primary Dependencies**: OpenAI SDK, TanStack Table v8, sass (SCSS)  
**Storage**: MySQL with JSON columns for system data (existing), conversations stored in JSON initially  
**Testing**: Manual testing initially, Jest/React Testing Library for future phases  
**Target Platform**: Web application via Docker (http://localhost:3000/)  
**Project Type**: Web (Next.js full-stack with API routes)  
**Performance Goals**: <30s for full rotation calculation (sequential), <5s per indicator (parallel batch of 5)  
**Constraints**: <200ms response for UI interactions, OpenAI API rate limits, external data source availability  
**Scale/Scope**: 15 indicator types, ~10-50 interventions per system, conversation history max 10 exchanges per cell

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Docker-First Development
- All development through Docker (`docker compose up`, not `npm run dev`) ✓
- OpenAI SDK will be added via npm, requires `docker compose build` ✓

### ✅ SCSS for Styling  
- New AI Assistant components will use SCSS (ai-assistant.scss) ✓
- Existing interventions-table already uses SCSS pattern ✓

### ✅ TypeScript Strict Typing
- All new components strictly typed (AIAssistant, CalculationContext, etc.) ✓
- Interfaces for CalculationResult, ConversationMessage, etc. ✓

### ✅ Database-First for Data
- Extends existing JSON structure in systems.json column ✓
- Adds: assumptions (markdown), conversation (array), reviewed (bool), confidence (enum) ✓
- All edits persist via existing PATCH /api/systems/:id pattern ✓

### ✅ Component Patterns
- Editable cells maintain click/✓/✕ pattern ✓
- Auto-open assistant on cell click (new behavior) ✓
- Callbacks via onUpdate for data refresh ✓
- formatValue() extended for confidence badges ✓

**Status**: ✅ All constitution requirements met. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application (Next.js App Router)
app/
├── api/
│   ├── systems/[id]/route.ts          # Existing - PATCH extended for conversations
│   └── ai/
│       ├── calculate-indicator/route.ts    # NEW - Calculate single indicator
│       ├── refine-value/route.ts           # NEW - Refine via dialogue
│       └── calculate-all-missing/route.ts  # NEW - Batch calculation

components/
├── interventions-table/               # Existing - modified
│   ├── EditableNumberCell.tsx         # MODIFIED - auto-open assistant, confidence badge
│   └── ...
└── ai-assistant/                      # NEW
    ├── AIAssistant.tsx                # Main component (replaces ChatBot.tsx)
    ├── ConversationHistory.tsx        # Message display
    ├── AssumptionsPanel.tsx           # 3-level assumptions viewer
    ├── CalculationProgress.tsx        # Progress indicator
    ├── MessageInput.tsx               # User input
    ├── ai-assistant.scss              # Styles
    └── index.ts

lib/
├── ai/                                # NEW
│   ├── indicator-calculator.ts        # Core IndicatorCalculator class
│   ├── prompts/                       # 15 indicator-specific prompts
│   │   ├── frequence.ts
│   │   ├── azote-mineral.ts
│   │   ├── rendement.ts
│   │   ├── ift.ts
│   │   └── ... (11 more)
│   └── types.ts                       # AI-specific types
├── db.ts                              # Existing - no changes
└── types.ts                           # MODIFIED - add ConversationMessage, CalculationResult

.env                                   # MODIFIED - add OPENAI_API_KEY, config
```

**Structure Decision**: Web application structure maintained. New `/ai/` directories for AI-specific code follow existing patterns. ChatBot.tsx removed, replaced by ai-assistant/ folder. No external data dependencies - IA uses knowledge + dialogue. Architecture ready for future MCP integration.

## Complexity Tracking

> **No violations - section not required**

All constitution requirements are met without exceptions. The feature extends existing patterns rather than introducing new complexity.

---

## Phase 0: Research Complete ✅

**Artifact**: [research.md](./research.md)

All NEEDS CLARIFICATION items resolved:
- ✅ OpenAI SDK integration pattern defined
- ✅ French-only language decision confirmed
- ✅ Hierarchical assumptions management strategy
- ✅ External data integration approach (scraping → MCP)
- ✅ Conversation management and pruning
- ✅ Confidence level calculation rules
- ✅ Performance optimization (parallel, cache)
- ✅ Error handling and resilience patterns

**Key Decisions**:
- Use OpenAI official SDK with gpt-4o-mini default
- All prompts and responses in French
- Markdown storage for assumptions at 3 levels
- No external data sources - IA knowledge + user dialogue
- Best-effort estimates, validation via dialogue

---

## Phase 1: Design Complete ✅

**Artifacts**: 
- [data-model.md](./data-model.md)
- [contracts/api-endpoints.md](./contracts/api-endpoints.md)
- [quickstart.md](./quickstart.md)

### Data Model
- Extends existing JSON structure (no schema migration)
- New fields: assumptions (markdown), conversation (array), confidence (enum)
- All types defined in TypeScript with strict typing
- Validation rules and state transitions documented

### API Contracts
- 3 new endpoints: calculate-indicator, refine-value, calculate-all-missing
- 1 extended endpoint: PATCH /api/systems/:id
- Rate limiting, error codes, testing examples included
- Response times: 2-10s single, 10-60s batch

### Quickstart Guide
- 5-7 hour path to working MVP
- Step-by-step: setup → infrastructure → first indicator → API → UI
- Troubleshooting and timeline estimates

### Agent Context Updated ✅
- GitHub Copilot instructions updated with:
  - TypeScript 5.x + Next.js 16.1.1 + React 19
  - OpenAI SDK, TanStack Table v8, SCSS
  - MySQL with JSON storage for conversations

---

## Re-evaluation: Constitution Check Post-Design ✅

### ✅ Docker-First Development
**Re-check**: All new npm packages (openai, cheerio) installed via npm → docker compose build. No direct npm run dev usage. ✓

### ✅ SCSS for Styling
**Re-check**: All new components (AIAssistant, ConversationHistory, etc.) use ai-assistant.scss. No Tailwind added. ✓

### ✅ TypeScript Strict Typing
**Re-check**: All interfaces defined (ConversationMessage, CalculationResult, etc.). No `any` except for legacy systemData parsing. ✓

### ✅ Database-First for Data
**Re-check**: All data persists to MySQL systems.json column via PATCH endpoint. Reviewed status tracked. No in-memory-only state. ✓

### ✅ Component Patterns
**Re-check**: EditableNumberCell maintains click/✓/✕ pattern. AIAssistant follows callback pattern with onUpdate. formatValue() extended for confidence badges. ✓

**Final Status**: ✅✅✅ All gates passed. No constitution violations. Ready for implementation.

---

## Implementation Phases (From Spec)

### Phase 1: Infrastructure (2-3 days)
- [ ] Extend JSON structure (assumptions, conversation)
- [ ] IndicatorCalculator service with OpenAI
- [ ] Environment configuration (.env)
- [ ] AIAssistant.tsx skeleton
- [ ] API endpoints: calculate-indicator, refine-value, calculate-all-missing
- [ ] Data migration (none needed, JSON extensions only)

### Phase 2: Core Indicators (3-4 days)
- [ ] Prompts: frequence, temps-travail, ges
- [ ] ConversationHistory component
- [ ] MessageInput component
- [ ] Integration with ProjectDetails
- [ ] Testing with 3 indicators

### Phase 3: Complex Calculations (5-6 days)
- [ ] Ephy scraper (IFT, EIQ)
- [ ] Barèmes loader (mécanisation, GNR)
- [ ] Prix agricoles scraper (phytos, semences, engrais, prix-vente)
- [ ] Remaining prompts (12 more indicators)

### Phase 4: UX Polish (3-4 days)
- [ ] AssumptionsPanel (3-level viewer)
- [ ] CalculationProgress indicator
- [ ] Batch calculation with progress
- [ ] Confidence badges in EditableNumberCell
- [ ] Auto-open assistant on cell click

### Phase 5: Optimization (2-3 days)
- [ ] File cache for external data
- [ ] Parallel calculation (batch of 5)
- [ ] Error logging and monitoring
- [ ] User documentation
- [ ] User testing and refinement

**Total Estimate**: 15-20 days

---

## Next Command

This plan is now complete. Proceed with implementation:

```bash
# Option 1: Manual implementation following quickstart.md
# Option 2: Generate detailed task breakdown
/speckit.tasks
```

**Implementation ready** ✅  
**Branch**: 001-ai-assistant-indicators  
**Artifacts**: plan.md, research.md, data-model.md, contracts/, quickstart.md  
**Agent context**: Updated for GitHub Copilot
