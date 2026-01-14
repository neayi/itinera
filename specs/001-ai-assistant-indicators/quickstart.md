# Quick Start: AI Assistant Implementation

**Date**: 2026-01-13 | **Feature**: 001-ai-assistant-indicators

## Overview

This guide provides the fastest path to implementing the AI-powered indicator calculator. Follow these steps in order.

## Prerequisites

✅ Docker and docker-compose installed  
✅ OpenAI API key (get from https://platform.openai.com/api-keys)  
✅ Node.js project with Next.js 16.1.1+ (already set up)  
✅ MySQL database with systems table (already exists)

## Step 1: Environment Setup (5 minutes)

### 1.1 Add OpenAI Dependency

```bash
# Add OpenAI SDK
npm install openai

# Rebuild Docker
docker compose build
```

### 1.2 Configure Environment Variables

Create/edit `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...  # Your API key from OpenAI
OPENAI_MODEL=gpt-4o-mini     # or gpt-4o for higher accuracy
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3

# Feature Flags
AI_ASSISTANT_ENABLED=true
AI_AUTO_CALCULATE=false
AI_MAX_CONVERSATIONS_LENGTH=10
```

### 1.3 Start Application

```bash
docker compose up
```

Verify at http://localhost:3000

---

## Step 2: Core Infrastructure (30 minutes-1 hour)

### 2.1 TypeScript Types

Create `lib/ai/types.ts`:

```typescript
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConversationMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;
  assumptions?: string[];
  calculation_steps?: string[];
  sources?: string[];
  confidence?: ConfidenceLevel;
  caveats?: string[];
}

export interface CalculationContext {
  systemData: any;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
}

export interface CalculationResult {
  value: number;
  confidence: ConfidenceLevel;
  conversation: ConversationMessage[];
  assumptionsMarkdown: string;
  assumptionsLevel: 'system' | 'step' | 'intervention';
  sources: string[];
  calculationSteps?: string[];
  caveats?: string[];
}
```

### 2.2 OpenAI Client

Create `lib/ai/openai-client.ts`:

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function callGPT(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    });
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
```

---

## Step 3: First Indicator Prompt (30 minutes)

### 3.1 Create Frequence Prompt

Create `lib/ai/prompts/frequence.ts`:

```typescript
export const FREQUENCE_SYSTEM_PROMPT = `
Tu es un assistant expert en agronomie française.

Ta tâche : Analyser la description d'une intervention agricole et déterminer sa fréquence annuelle.

Règles :
- Fréquence par défaut = 1.0 si non spécifié
- Chercher des indices : "2 fois", "tous les 2 ans" → fréquence = 2 ou 0.5
- Si "selon besoin" ou "si nécessaire" → fréquence = 1.0 (assumer 1 fois)

Format de sortie (JSON strict) :
{
  "value": number,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication brève en français",
  "assumptions": ["liste hypothèses"],
  "sources": ["description intervention"]
}
`;

export function buildFrequencePrompt(context: any): string {
  return `
Intervention : "${context.intervention.name}"
Description : "${context.intervention.description || 'Aucune description'}"

Détermine la fréquence annuelle de cette intervention.
`;
}
```

### 3.2 Create Indicator Calculator

Create `lib/ai/indicator-calculator.ts`:

```typescript
import { callGPT } from './openai-client';
import { CalculationContext, CalculationResult } from './types';
import { FREQUENCE_SYSTEM_PROMPT, buildFrequencePrompt } from './prompts/frequence';

export class IndicatorCalculator {
  async calculateIndicator(
    context: CalculationContext
  ): Promise<CalculationResult> {
    const { systemData, stepIndex, interventionIndex, indicatorKey } = context;
    
    const step = systemData.steps[stepIndex];
    const intervention = step.interventions[interventionIndex];
    
    // For now, only handle frequence
    if (indicatorKey !== 'frequence') {
      throw new Error(`Indicator ${indicatorKey} not implemented yet`);
    }
    
    try {
      const prompt = buildFrequencePrompt({ intervention });
      const responseText = await callGPT(prompt, FREQUENCE_SYSTEM_PROMPT);
      const parsed = JSON.parse(responseText);
      
      return {
        value: parsed.value,
        confidence: parsed.confidence,
        conversation: [
          {
            role: 'system',
            content: `Calcul de la fréquence pour ${intervention.name}`,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: parsed.reasoning,
            assumptions: parsed.assumptions,
            sources: parsed.sources,
            confidence: parsed.confidence,
            timestamp: new Date().toISOString(),
          },
        ],
        assumptionsMarkdown: '',
        assumptionsLevel: 'intervention',
        sources: parsed.sources,
        caveats: [],
      };
    } catch (error) {
      // Fallback on error
      return {
        value: 1,
        confidence: 'low',
        conversation: [
          {
            role: 'system',
            content: `Erreur calcul: ${error.message}. Valeur par défaut utilisée.`,
            timestamp: new Date().toISOString(),
          },
        ],
        assumptionsMarkdown: '',
        assumptionsLevel: 'intervention',
        sources: ['fallback'],
        caveats: ['Calcul échoué, valeur par défaut utilisée'],
      };
    }
  }
}

export const indicatorCalculator = new IndicatorCalculator();
```

---

## Step 4: First API Endpoint (30 minutes)

### 4.1 Create Calculate Endpoint

Create `app/api/ai/calculate-indicator/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { indicatorCalculator } from '@/lib/ai/indicator-calculator';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemId, stepIndex, interventionIndex, indicatorKey } = body;
    
    // Validate input
    if (!systemId || stepIndex === undefined || interventionIndex === undefined || !indicatorKey) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Fetch system from database
    const results = await query('SELECT * FROM systems WHERE id = ?', [systemId]);
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'SYSTEM_NOT_FOUND', message: `System ${systemId} not found` },
        { status: 404 }
      );
    }
    
    const system = results[0];
    const systemData = JSON.parse(system.json);
    
    // Calculate indicator
    const result = await indicatorCalculator.calculateIndicator({
      systemData,
      stepIndex,
      interventionIndex,
      indicatorKey,
    });
    
    // Update system JSON
    const intervention = systemData.steps[stepIndex].interventions[interventionIndex];
    const valueIndex = intervention.values.findIndex((v: any) => v.key === indicatorKey);
    
    if (valueIndex >= 0) {
      intervention.values[valueIndex] = {
        key: indicatorKey,
        value: result.value,
        reviewed: false,
        confidence: result.confidence,
        conversation: result.conversation,
      };
    } else {
      intervention.values.push({
        key: indicatorKey,
        value: result.value,
        reviewed: false,
        confidence: result.confidence,
        conversation: result.conversation,
      });
    }
    
    // Save to database
    await query(
      'UPDATE systems SET json = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(systemData), systemId]
    );
    
    return NextResponse.json({
      value: result.value,
      confidence: result.confidence,
      conversation: result.conversation,
      updatedSystemData: systemData,
    });
    
  } catch (error) {
    console.error('Calculate indicator error:', error);
    return NextResponse.json(
      { error: 'CALCULATION_FAILED', message: error.message },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Test First Calculation (10 minutes)

### 5.1 Test with cURL

```bash
curl -X POST http://localhost:3000/api/ai/calculate-indicator \
  -H "Content-Type: application/json" \
  -d '{
    "systemId": "1",
    "stepIndex": 0,
    "interventionIndex": 0,
    "indicatorKey": "frequence"
  }'
```

Expected response:
```json
{
  "value": 1,
  "confidence": "high",
  "conversation": [
    {
      "role": "system",
      "content": "Calcul de la fréquence pour Labour",
      "timestamp": "2026-01-13T..."
    },
    {
      "role": "assistant",
      "content": "Cette intervention est effectuée une fois par an...",
      "assumptions": ["..."],
      "confidence": "high",
      "timestamp": "2026-01-13T..."
    }
  ],
  "updatedSystemData": { /* ... */ }
}
```

---

## Step 6: Add AI Assistant UI (2-3 hours)

### 6.1 Create Basic Component

Create `components/ai-assistant/AIAssistant.tsx`:

```typescript
'use client';

import { useState } from 'react';
import './ai-assistant.scss';

interface AIAssistantProps {
  systemData: any;
  systemId: string;
  focusedCell?: {
    stepIndex: number;
    interventionIndex: number;
    fieldKey: string;
  };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onValueUpdate: (updatedSystemData: any) => void;
}

export function AIAssistant({
  systemData,
  systemId,
  focusedCell,
  isOpen,
  setIsOpen,
  onValueUpdate,
}: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  
  const handleCalculate = async () => {
    if (!focusedCell) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/calculate-indicator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId,
          ...focusedCell,
          indicatorKey: focusedCell.fieldKey,
        }),
      });
      
      const result = await response.json();
      onValueUpdate(result.updatedSystemData);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <h3>Assistant IA</h3>
        <button onClick={() => setIsOpen(false)}>✕</button>
      </div>
      
      <div className="ai-assistant-content">
        {focusedCell ? (
          <>
            <p>Cellule: {focusedCell.fieldKey}</p>
            <button onClick={handleCalculate} disabled={loading}>
              {loading ? 'Calcul en cours...' : 'Calculer'}
            </button>
          </>
        ) : (
          <p>Cliquez sur une cellule pour commencer</p>
        )}
      </div>
    </div>
  );
}
```

### 6.2 Create Styles

Create `components/ai-assistant/ai-assistant.scss`:

```scss
.ai-assistant {
  position: fixed;
  right: 20px;
  top: 80px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    
    h3 {
      margin: 0;
      font-size: 1rem;
    }
    
    button {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      
      &:hover {
        background: #e9ecef;
        border-radius: 4px;
      }
    }
  }
  
  &-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
}
```

---

## Next Steps

✅ **You now have**:
- OpenAI integration working
- First indicator (frequence) calculating
- Basic API endpoint functional
- Minimal UI for testing

**Continue with**:
1. Add more indicator prompts (ift, mecanisation, etc.)
2. Implement conversation history display
3. Add refinement endpoint for user dialogue
4. Build AssumptionsPanel component
5. Implement batch calculation endpoint
6. Add progress indicators
7. Integrate with EditableNumberCell

**See full spec for complete feature details**: [spec.md](./spec.md)

---

## Troubleshooting

### OpenAI API Key Error
```
Error: OpenAI API key not found
```
**Fix**: Ensure `OPENAI_API_KEY` is set in `.env.local` and restart Docker

### Rate Limit Exceeded
```
Error: Rate limit exceeded
```
**Fix**: Wait 60 seconds or upgrade OpenAI tier at https://platform.openai.com/account/billing

### Docker Build Fails After npm install
```
Error: Module 'openai' not found
```
**Fix**: 
```bash
docker compose build --no-cache
docker compose up
```

---

## Estimated Timeline

- **Setup** (Step 1): 5 minutes
- **Core infrastructure** (Step 2): 30 minutes-1 hour
- **First indicator** (Step 3): 30 minutes
- **First API** (Step 4): 30 minutes
- **Testing** (Step 5): 10 minutes
- **Basic UI** (Step 6): 2-3 hours

**Total for MVP**: ~4-6 hours to working prototype

**Full feature** (all 15 indicators + complete UI): 15-20 days as per spec
