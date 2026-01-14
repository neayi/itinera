# Research: Assistant IA pour calcul des indicateurs

**Date**: 2026-01-13 | **Feature**: 001-ai-assistant-indicators

## Purpose

This document consolidates research findings to resolve all NEEDS CLARIFICATION items and establish best practices for implementing the AI-powered indicator calculator.

## OpenAI SDK Integration

### Decision: Use OpenAI official Node.js SDK

**Rationale**: Official SDK provides typed interfaces, automatic retries, streaming support, and handles authentication securely.

**Implementation**:
```bash
npm install openai
```

```typescript
// lib/ai/openai-client.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callGPT(prompt: string, systemPrompt: string) {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
  });
  return response.choices[0].message.content;
}
```

**Alternatives considered**:
- Direct API calls via fetch: More manual, no type safety, requires custom retry logic
- LangChain: Over-engineered for this use case, adds dependency weight

**Best practices**:
- Store API key in `.env.local` (not committed)
- Use environment variables for model selection (gpt-4o-mini vs gpt-4o)
- Set low temperature (0.3) for deterministic calculations
- Implement timeout handling (30s max per call)

## French Language Prompts

### Decision: All prompts, conversations, and responses in French

**Rationale**: 
- Agricultural terminology is domain-specific (e.g., "désherbage", "épandage", "semences fermières")
- External data sources are French (Ephy, Cerfrance, Arvalis)
- Regulatory context is French-specific (bio/AB, IFT, aires de captage)
- Users are French-speaking farmers and agronomists

**Implementation**:
```typescript
// Example prompt structure
export const FREQUENCE_PROMPT = `
Tu es un assistant expert en agronomie française. 

Contexte:
{systemAssumptions}
{stepAssumptions}
{interventionAssumptions}

Tâche: Analyser la description de l'intervention et déterminer sa fréquence annuelle.

Format de sortie JSON:
{
  "value": number,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication en français",
  "assumptions": ["liste des hypothèses"],
  "sources": ["sources utilisées"]
}
`;
```

**Best practices**:
- Use formal "vous" for user-facing messages, "tu" for system instructions
- Include agricultural glossary in system prompts
- Handle regional variations (e.g., "quintaux" vs "tonnes")

## Hierarchical Assumptions Management

### Decision: Markdown storage with cascade reading (system → step → intervention)

**Rationale**:
- Flexible text format allows rich descriptions without schema constraints
- Markdown is human-readable and editable
- Cascade pattern matches agricultural decision-making (global → culture → operation)
- Conflict resolution follows specificity principle (intervention > step > system)

**Implementation Pattern**:
```typescript
function readAssumptionsContext(systemData, stepIndex, interventionIndex) {
  const contexts = [];
  
  // 1. System level
  if (systemData.assumptions) {
    contexts.push({
      level: 'system',
      content: systemData.assumptions,
      parsed: parseMarkdownAssumptions(systemData.assumptions)
    });
  }
  
  // 2. Step level
  const step = systemData.steps[stepIndex];
  if (step?.assumptions) {
    contexts.push({
      level: 'step',
      content: step.assumptions,
      parsed: parseMarkdownAssumptions(step.assumptions)
    });
  }
  
  // 3. Intervention level (most specific, overrides others)
  const intervention = step?.interventions[interventionIndex];
  if (intervention?.assumptions) {
    contexts.push({
      level: 'intervention',
      content: intervention.assumptions,
      parsed: parseMarkdownAssumptions(intervention.assumptions)
    });
  }
  
  return contexts;
}

function parseMarkdownAssumptions(markdown: string) {
  // Extract key assumptions from markdown
  // Look for patterns like: - **Key**: Value
  const assumptions = new Map<string, string>();
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^-\s+\*\*([^*]+)\*\*\s*:\s*(.+)$/);
    if (match) {
      assumptions.set(match[1].toLowerCase(), match[2]);
    }
  }
  
  return assumptions;
}
```

**Conflict Detection**:
```typescript
function detectConflicts(contexts) {
  const conflicts = [];
  const allAssumptions = new Map();
  
  for (const ctx of contexts) {
    for (const [key, value] of ctx.parsed) {
      if (allAssumptions.has(key) && allAssumptions.get(key) !== value) {
        conflicts.push({
          key,
          systemLevel: allAssumptions.get(key),
          specificLevel: value,
          resolution: 'Use specific level (more granular wins)'
        });
      }
      allAssumptions.set(key, value); // Overwrite with more specific
    }
  }
  
  return conflicts;
}
```

**Best practices**:
- Always read all three levels in order for complete context
- Use parsed map for programmatic checks (bio yes/no, irrigation available)
- Keep original markdown for AI context (richer than key-value)
- Detect and warn user about conflicts rather than silently resolving

## Calcul sans Données Externes

### Décision: L'IA utilise uniquement sa connaissance et le dialogue

**Rationale**:
- Démarrage immédiat sans dépendances complexes
- Pas de maintenance de scrapers fragiles
- Focus sur la qualité du dialogue et l'apprentissage
- Architecture prête pour future intégration MCP

**Sources pour les calculs** :
1. **Connaissance GPT** : Moyennes agricoles françaises, prix indicatifs, pratiques courantes
2. **Descriptions** : Analyse sémantique des textes fournis (intervention, step, système)
3. **Assumptions** : Hypothèses en markdown aux 3 niveaux (système/step/intervention)
4. **Dialogue** : Affinage avec l'utilisateur pour préciser les valeurs réelles

**Exemples de valeurs proposées** :
```typescript
// Prix moyens connus par l'IA (2024-2025)
const PRIX_MOYENS = {
  ble_bio: 350,        // €/tonne
  ble_conv: 200,       // €/tonne
  orge: 180,
  colza: 450,
  gnr: 1.10,           // €/L
  // ... etc
};

// Coûts mécanisation indicatifs
const MECANISATION_MOYENS = {
  labour: 100,         // €/ha
  semis: 60,
  moisson: 120,
  // ... etc
};
```

**Prompts orientés dialogue** :
```typescript
export const IFT_SYSTEM_PROMPT = `
Tu es un assistant expert en agronomie française.

Pour calculer l'IFT :
1. Identifie les produits phytosanitaires mentionnés dans la description
2. Utilise ta connaissance des doses homologuées courantes
3. Propose une estimation IFT
4. Précise TOUJOURS que c'est une estimation
5. Invite l'utilisateur à préciser les doses réelles

Format de sortie :
{
  "value": number,
  "confidence": "medium",  // Toujours medium ou low sans données externes
  "reasoning": "Estimation basée sur [produit] à dose courante de [X] L/ha. Précisez la dose exacte pour affiner.",
  "caveats": ["Estimation indicative", "Vérifier dose réelle"]
}
`;
```

**Stratégie de confiance** :
- **high** : Seulement si explicitement mentionné dans description (ex: "rendement de 65 qtx")
- **medium** : Calcul avec hypothèses raisonnables (ex: labour avec tracteur 150 CV)
- **low** : Estimation générale sans contexte précis

**Alternatives considérées** :
- Scraping Ephy/prix : Complexité, fragilité, maintenance
- Barèmes statiques JSON : Obsolète rapidement, source unique
- Hard-coded defaults : Pas de flexibilité, pas d'explication

**Migration future** :
Quand MCP servers seront disponibles, l'architecture est prête :
```typescript
// Interface reste identique
export interface DataSource {
  getPrixVente(culture: string, isBio: boolean): Promise<number>;
  getIFT(produit: string, dose: number): Promise<number>;
}

// Implémentation 1: IA knowledge (actuelle)
export class AIKnowledgeSource implements DataSource { ... }

// Implémentation 2: MCP (future)
export class MCPDataSource implements DataSource { ... }
```

## Conversation Management

### Decision: Store in JSON values array, limit to 10 exchanges

**Rationale**:
- Keeps data with the value it relates to
- No additional database schema needed
- Can migrate to separate table if performance issues arise
- 10 exchanges is enough for refinement without bloat

**Pruning strategy**:
```typescript
function pruneConversation(conversation: ConversationMessage[]): ConversationMessage[] {
  if (conversation.length <= 10) return conversation;
  
  // Keep: system message + first user/assistant pair + last 8 messages
  return [
    conversation[0], // System prompt
    conversation[1], // Initial assistant calculation
    ...conversation.slice(-8) // Recent history
  ];
}
```

**Summarization** (if needed later):
```typescript
async function summarizeOldConversation(messages: ConversationMessage[]) {
  const summary = await callGPT(
    JSON.stringify(messages),
    "Résume cette conversation en 2-3 phrases clés conservant les hypothèses importantes."
  );
  return {
    role: 'system',
    content: `[Résumé conversation précédente]: ${summary}`,
    timestamp: new Date().toISOString()
  };
}
```

## Confidence Level Calculation

### Decision: Rule-based confidence scoring

**Criteria**:
- **High**: Value found in external source (Ephy, prix) OR explicitly mentioned in description
- **Medium**: Calculated from assumptions with some inference
- **Low**: Fallback/default used OR significant assumptions made

**Implementation**:
```typescript
function calculateConfidence(result: CalculationResult): 'high' | 'medium' | 'low' {
  if (result.caveats && result.caveats.length > 0) return 'low';
  if (result.sources.some(s => s.includes('default') || s.includes('fallback'))) return 'low';
  if (result.sources.some(s => s.includes('ephy') || s.includes('prix-marche'))) return 'high';
  if (result.assumptions.length > 3) return 'medium';
  return 'medium';
}
```

## Performance Optimization

### Parallel Calculation Strategy

**Decision**: Batch up to 5 indicators in parallel, with progress updates

```typescript
async function calculateAllMissing(systemData, progressCallback) {
  const missing = findMissingIndicators(systemData);
  const results = [];
  
  for (let i = 0; i < missing.length; i += 5) {
    const batch = missing.slice(i, i + 5);
    progressCallback({ current: i, total: missing.length });
    
    const batchResults = await Promise.allSettled(
      batch.map(item => calculateIndicator(item))
    );
    
    results.push(...batchResults);
  }
  
  return results;
}
```

**Rationale**:
- OpenAI rate limits (3500 RPM on tier 1)
- User experience: show progress, don't block 30s
- Error isolation: one failure doesn't block others

### Pas de Cache Nécessaire

Sans données externes, pas besoin de cache. Les calculs OpenAI sont directs et rapides (2-5s par indicateur).

## Error Handling & Resilience

### Decision: Never block, always return best-effort with warnings

**Pattern**:
```typescript
async function calculateIndicator(context): Promise<CalculationResult> {
  try {
    const result = await tryCalculation(context);
    return result;
  } catch (error) {
    console.error('Calculation failed:', error);
    
    // Return low-confidence fallback
    return {
      value: getFallbackValue(context.indicatorKey),
      confidence: 'low',
      caveats: [
        `Erreur lors du calcul: ${error.message}`,
        'Valeur par défaut utilisée',
        'Veuillez vérifier manuellement'
      ],
      conversation: [{
        role: 'system',
        content: `Erreur: ${error.message}. Valeur par défaut proposée.`,
        timestamp: new Date().toISOString()
      }],
      assumptions: [],
      sources: ['fallback']
    };
  }
}
```

**Fallback values**:
```typescript
const FALLBACKS = {
  frequence: 1,
  rendementTMS: 60, // qtx/ha moyenne France
  prixVente: 150, // €/tonne moyenne céréales
  tempsTravail: 0.5, // h/ha moyenne
  // ... etc
};
```

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **OpenAI Integration** | Official SDK, gpt-4o-mini default | Type safety, cost-effective, reliable |
| **Language** | French only | Domain-specific terminology, data sources, users |
| **Assumptions Storage** | Markdown in JSON, 3 levels | Flexible, human-readable, hierarchical |
| **External Data** | None - IA knowledge + dialogue | Simple, immediate, focus on user interaction |
| **Conversations** | JSON array, 10 max messages | Simple, colocated with value, prune old |
| **Confidence** | Rule-based scoring | Transparent, predictable, no ML needed |
| **Performance** | 5 parallel, progress UI | Balance speed/rate limits/UX |
| **Error Handling** | Best-effort estimates, dialogue | Never block user, always provide value |

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
