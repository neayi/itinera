# Data Model: Assistant IA pour calcul des indicateurs

**Date**: 2026-01-13 | **Feature**: 001-ai-assistant-indicators

## Overview

This document defines all data structures, types, and database schema changes for the AI assistant feature. All entities are extensions of the existing `systems.json` column structure.

## Database Schema Changes

### Existing Schema (No Changes)

```sql
-- Table: systems (no modifications needed)
CREATE TABLE systems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farm_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_type VARCHAR(100),
  productions VARCHAR(255),
  gps_location VARCHAR(255),
  json LONGTEXT,  -- ← EXTENDED STRUCTURE BELOW
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id)
);
```

**Migration**: None required. We extend the JSON structure within the existing `json` column.

## JSON Structure Extensions

### Root Level (System)

**New Fields**:
```typescript
{
  "assumptions"?: string,     // NEW: Markdown text, system-level hypotheses
  "updatedAt"?: string,       // NEW: ISO timestamp of last modification
  "steps": [...]              // Existing: array of steps
}
```

**Example**:
```json
{
  "assumptions": "## Caractéristiques du système\n\n- **Agriculture biologique** : Conduit en AB, certifié Ecocert\n- **Non irrigué** : Pas d'irrigation disponible\n",
  "updatedAt": "2026-01-13T10:00:00Z",
  "steps": [...]
}
```

### Step Level

**New Fields**:
```typescript
{
  "id": string,
  "name": string,
  "startDate": string,
  "endDate": string,
  "assumptions"?: string,        // NEW: Markdown text, step-level hypotheses
  "updatedAt"?: string,          // NEW: ISO timestamp
  "stepValues"?: StepValue[],    // Existing: step-level indicator values
  "interventions": [...]         // Existing: array of interventions
}
```

**Example**:
```json
{
  "id": "step1",
  "name": "Orge + Lupin",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-07-20T00:00:00.000Z",
  "assumptions": "## Orge + Lupin\n\n- **Semences fermières** pour le lupin\n- **Export des pailles** à la récolte\n",
  "updatedAt": "2026-01-13T10:15:00Z",
  "interventions": [...]
}
```

### Intervention Level

**New Fields**:
```typescript
{
  "id": string,
  "name": string,
  "description": string,
  "day": string,
  "type": string,
  "assumptions"?: string,        // NEW: Markdown text, intervention-level hypotheses
  "updatedAt"?: string,          // NEW: ISO timestamp
  "values": InterventionValue[]  // Extended: add conversation, confidence
}
```

**Example**:
```json
{
  "id": "uuid-123",
  "name": "Labour",
  "description": "Labour avec tracteur 150 CV",
  "day": "0",
  "type": "intervention_top",
  "assumptions": "## Labour\n\n- **Matériel** : Tracteur 150 CV + charrue 4 corps\n- **Vitesse** : 6 km/h\n",
  "updatedAt": "2026-01-13T10:30:00Z",
  "values": [...]
}
```

### Intervention Value (Extended)

**New Fields**:
```typescript
interface InterventionValue {
  key: string;                    // Existing: indicator name (frequence, ift, etc.)
  value: number;                  // Existing: numeric value
  reviewed?: boolean | "n/a";     // Existing: user-verified status
  confidence?: "high" | "medium" | "low";  // NEW: AI confidence level
  conversation?: ConversationMessage[];    // NEW: chat history for this cell
}
```

**Example**:
```json
{
  "key": "mecanisation",
  "value": 130,
  "reviewed": true,
  "confidence": "medium",
  "conversation": [
    {
      "role": "system",
      "content": "Calcul du coût de mécanisation pour Labour...",
      "timestamp": "2026-01-13T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Pour un labour avec tracteur 150 CV...",
      "assumptions": ["Tracteur 150 CV", "Charrue 4 corps"],
      "calculation_steps": ["Surface/heure = 2.0 × 6 = 12 ha/h"],
      "sources": ["Barème Cerfrance 2025"],
      "confidence": "medium",
      "caveats": [],
      "timestamp": "2026-01-13T10:30:01Z"
    },
    {
      "role": "user",
      "content": "La charrue n'a que 4 corps, pas 5",
      "timestamp": "2026-01-13T10:30:15Z"
    },
    {
      "role": "assistant",
      "content": "D'accord, je recalcule...",
      "timestamp": "2026-01-13T10:30:16Z"
    }
  ]
}
```

## TypeScript Interfaces

### Core Types

```typescript
// lib/types.ts (additions)

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ReviewStatus = boolean | 'n/a' | undefined;

export interface ConversationMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;  // ISO 8601
  
  // Assistant-specific fields
  assumptions?: string[];
  calculation_steps?: string[];
  sources?: string[];
  confidence?: ConfidenceLevel;
  caveats?: string[];
  
  // User-specific fields
  action?: 'manual_edit' | 'approve' | 'refine';
  previous_value?: number;
  new_value?: number;
}

export interface InterventionValue {
  key: string;
  value: number;
  reviewed?: ReviewStatus;
  confidence?: ConfidenceLevel;
  conversation?: ConversationMessage[];
}

export interface Intervention {
  id: string;
  name: string;
  description?: string;
  day?: string;
  type?: string;
  assumptions?: string;        // Markdown
  updatedAt?: string;
  values: InterventionValue[];
}

export interface Step {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  assumptions?: string;        // Markdown
  updatedAt?: string;
  stepValues?: { key: string; value: number }[];
  interventions: Intervention[];
}

export interface SystemData {
  assumptions?: string;        // Markdown
  updatedAt?: string;
  steps: Step[];
}
```

### AI-Specific Types

```typescript
// lib/ai/types.ts (new file)

export interface CalculationContext {
  systemData: SystemData;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
  userMessage?: string;  // For refinements
}

export interface CalculationResult {
  value: number | string;
  confidence: ConfidenceLevel;
  conversation: ConversationMessage[];
  assumptionsMarkdown: string;      // To append to appropriate level
  assumptionsLevel: 'system' | 'step' | 'intervention';
  sources: string[];
  calculationSteps?: string[];
  caveats?: string[];
}

export interface AssumptionsContext {
  system?: {
    level: 'system';
    content: string;
    parsed: Map<string, string>;
  };
  step?: {
    level: 'step';
    content: string;
    parsed: Map<string, string>;
  };
  intervention?: {
    level: 'intervention';
    content: string;
    parsed: Map<string, string>;
  };
}

export interface BatchCalculationSummary {
  calculatedCount: number;
  totalMissing: number;
  results: {
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
    value: number;
    confidence: ConfidenceLevel;
    success: boolean;
    error?: string;
  }[];
}
```

## Validation Rules

### Assumptions Markdown

- **Format**: Must be valid markdown
- **Structure**: Recommended format is `- **Key**: Value`
- **Max length**: 10,000 characters per level
- **Encoding**: UTF-8

### Conversation Array

- **Max messages**: 10 per value (pruned automatically)
- **Required fields**: role, content, timestamp
- **Timestamp format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### Confidence Level

- **Values**: Only 'high', 'medium', or 'low'
- **Default**: Omitted (undefined) if not AI-calculated

### Reviewed Status

- **Values**: true (user verified), false (AI prediction), 'n/a' (not applicable), undefined (unknown)
- **Transition**: false → true on user edit, never back to false

## State Transitions

### Value Lifecycle

```
[undefined/null] 
    ↓ (AI calculates)
[value + reviewed=false + confidence=low/medium/high + conversation]
    ↓ (user edits or approves)
[value + reviewed=true + conversation updated]
    ↓ (user re-opens chat, AI recalculates)
[value + reviewed=false + confidence=... + conversation appended]
```

### Assumptions Updates

```
[no assumptions]
    ↓ (AI discovers info during calculation)
[assumptions += new markdown block]
    ↓ (user refines via chat)
[assumptions += conversation-derived info]
    ↓ (AI detects conflict)
[warning displayed, user resolves, assumptions updated]
```

## Indexes & Performance

No database indexes needed (all data in JSON column). Performance considerations:

- **JSON size**: Monitor `systems.json` column size. Alert if >1MB per system.
- **Pruning**: Conversations auto-pruned to 10 messages max.
- **Migration trigger**: If multiple systems exceed 1MB, consider migration to:
  ```sql
  CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    system_id INT NOT NULL,
    step_index INT NOT NULL,
    intervention_index INT NOT NULL,
    indicator_key VARCHAR(50) NOT NULL,
    messages JSON NOT NULL,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
  );
  ```

## Migration Scripts

**None required for initial implementation.** All changes are additive to existing JSON structure.

**For future migration** (if needed):
```sql
-- Extract conversations from systems.json to separate table
INSERT INTO conversations (system_id, step_index, intervention_index, indicator_key, messages)
SELECT 
  s.id,
  step_idx,
  intervention_idx,
  value_key,
  JSON_EXTRACT(value, '$.conversation')
FROM systems s
CROSS JOIN JSON_TABLE(
  s.json,
  '$.steps[*]' COLUMNS (
    step_idx FOR ORDINALITY,
    interventions JSON PATH '$.interventions'
  )
) AS steps
WHERE JSON_EXTRACT(value, '$.conversation') IS NOT NULL;
```

## Data Relationships

```
System (root JSON)
  ├─ assumptions (markdown)
  ├─ updatedAt
  └─ steps[]
      ├─ assumptions (markdown)
      ├─ updatedAt
      └─ interventions[]
          ├─ assumptions (markdown)
          ├─ updatedAt
          └─ values[]
              ├─ key (indicator name)
              ├─ value (number)
              ├─ reviewed (bool | "n/a")
              ├─ confidence ("high"|"medium"|"low")
              └─ conversation[]
                  ├─ role ("system"|"assistant"|"user")
                  ├─ content (string)
                  ├─ timestamp (ISO)
                  └─ [metadata fields]
```

**Cascade behavior**: 
- Deleting a system deletes all nested data (standard JSON behavior)
- No orphaned conversations possible
- updatedAt propagates up (intervention → step → system on any change)

## Example: Complete Value with AI Interaction

```json
{
  "key": "ift",
  "value": 3.2,
  "reviewed": false,
  "confidence": "high",
  "conversation": [
    {
      "role": "system",
      "content": "Calcul de l'IFT pour Désherbage blé",
      "timestamp": "2026-01-13T14:00:00Z"
    },
    {
      "role": "assistant",
      "content": "J'ai identifié le produit Fosbury dans la base Ephy.\n\n**Calcul IFT** :\n- Dose appliquée : 5 L/ha\n- Dose max d'emploi (Ephy) : 6 L/ha\n- IFT = 5 / 6 = 0.83\n\nProduit utilisé seul, IFT total = **0.83**",
      "assumptions": [
        "Produit: Fosbury (glyphosate)",
        "Dose: 5 L/ha",
        "Application unique"
      ],
      "calculation_steps": [
        "Recherche Ephy: Fosbury trouvé",
        "Dose max emploi: 6 L/ha",
        "IFT = dose appliquée / dose max = 5/6 = 0.83"
      ],
      "sources": [
        "Base Ephy ANSES",
        "Description intervention"
      ],
      "confidence": "high",
      "caveats": [],
      "timestamp": "2026-01-13T14:00:02Z"
    },
    {
      "role": "user",
      "content": "Je passe 2 fois, pas 1 fois",
      "timestamp": "2026-01-13T14:01:00Z"
    },
    {
      "role": "assistant",
      "content": "Compris ! Avec 2 passages :\n\nIFT = 0.83 × 2 = **1.66**\n\nJe mets à jour la fréquence et l'IFT.",
      "assumptions": [
        "Fréquence: 2 passages/an"
      ],
      "timestamp": "2026-01-13T14:01:01Z"
    }
  ]
}
```

This value shows:
- ✅ AI-calculated with high confidence (Ephy data found)
- ✅ Unreviewed (yellow background in UI)
- ✅ Conversation shows reasoning and user refinement
- ✅ All metadata for transparency and audit trail
