# API Contracts: AI Assistant Endpoints

**Date**: 2026-01-13 | **Feature**: 001-ai-assistant-indicators

## Overview

This document defines the REST API contracts for AI-powered indicator calculation endpoints. All endpoints follow Next.js API Routes patterns and return JSON responses.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://[domain]/api`

## Authentication

All endpoints require valid session cookies (existing auth system). No additional authentication needed.

## Common Types

```typescript
type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConversationMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;  // ISO 8601
  assumptions?: string[];
  calculation_steps?: string[];
  sources?: string[];
  confidence?: ConfidenceLevel;
  caveats?: string[];
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
```

---

## POST `/api/ai/calculate-indicator`

Calculate a single indicator value for a specific intervention using AI.

### Request

```typescript
{
  systemId: string;           // System database ID
  stepIndex: number;          // 0-based step index in JSON
  interventionIndex: number;  // 0-based intervention index
  indicatorKey: string;       // e.g., "frequence", "ift", "mecanisation"
}
```

**Example**:
```json
{
  "systemId": "42",
  "stepIndex": 0,
  "interventionIndex": 2,
  "indicatorKey": "mecanisation"
}
```

### Response (Success - 200)

```typescript
{
  value: number | string;
  confidence: ConfidenceLevel;
  conversation: ConversationMessage[];
  updatedSystemData: SystemData;  // Full updated JSON
}
```

**Example**:
```json
{
  "value": 130,
  "confidence": "medium",
  "conversation": [
    {
      "role": "system",
      "content": "Calcul du coût de mécanisation pour Labour...",
      "timestamp": "2026-01-13T14:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Pour un labour avec tracteur 150 CV...",
      "assumptions": ["Tracteur 150 CV", "Charrue 4 corps"],
      "calculation_steps": ["Amortissement = 45 €/ha", "Total = 130 €/ha"],
      "sources": ["Barème Cerfrance 2025"],
      "confidence": "medium",
      "timestamp": "2026-01-13T14:30:02Z"
    }
  ],
  "updatedSystemData": { /* full system JSON */ }
}
```

### Response (Error - 400)

```json
{
  "error": "INVALID_INDICATOR",
  "message": "Indicator key 'invalid' is not recognized"
}
```

### Response (Error - 404)

```json
{
  "error": "SYSTEM_NOT_FOUND",
  "message": "System with ID '42' does not exist"
}
```

### Response (Error - 500)

```json
{
  "error": "CALCULATION_FAILED",
  "message": "OpenAI API error",
  "details": "Rate limit exceeded"
}
```

**Note**: Even on 500, a fallback value with low confidence may be returned instead of error.

---

## POST `/api/ai/refine-value`

Refine an existing calculated value through conversation with the AI.

### Request

```typescript
{
  systemId: string;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
  userMessage: string;        // User's refinement question/correction
}
```

**Example**:
```json
{
  "systemId": "42",
  "stepIndex": 0,
  "interventionIndex": 2,
  "indicatorKey": "mecanisation",
  "userMessage": "La charrue n'a que 4 corps, pas 5"
}
```

### Response (Success - 200)

```typescript
{
  value: number | string;       // Potentially updated value
  confidence: ConfidenceLevel;
  conversation: ConversationMessage[];  // Includes user message + AI response
  updatedSystemData: SystemData;
}
```

**Example**:
```json
{
  "value": 145,
  "confidence": "medium",
  "conversation": [
    /* ... previous messages ... */,
    {
      "role": "user",
      "content": "La charrue n'a que 4 corps, pas 5",
      "timestamp": "2026-01-13T14:35:00Z"
    },
    {
      "role": "assistant",
      "content": "D'accord, je recalcule avec une charrue 4 corps...",
      "assumptions": ["Charrue 4 corps, largeur 2.0 m"],
      "calculation_steps": ["Surface/heure = 2.0 × 6 = 12 ha/h"],
      "confidence": "medium",
      "timestamp": "2026-01-13T14:35:02Z"
    }
  ],
  "updatedSystemData": { /* full system JSON */ }
}
```

### Response (Error - 400)

```json
{
  "error": "EMPTY_MESSAGE",
  "message": "userMessage cannot be empty"
}
```

---

## POST `/api/ai/calculate-all-missing`

Calculate all missing indicators (where `reviewed` is false or undefined) for an entire system.

### Request

```typescript
{
  systemId: string;
}
```

**Example**:
```json
{
  "systemId": "42"
}
```

### Response (Success - 200)

```typescript
{
  calculatedCount: number;
  totalMissing: number;
  updatedSystemData: SystemData;
  summary: {
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
    value: number | string;
    confidence: ConfidenceLevel;
    success: boolean;
    error?: string;
  }[];
}
```

**Example**:
```json
{
  "calculatedCount": 12,
  "totalMissing": 15,
  "updatedSystemData": { /* full system JSON */ },
  "summary": [
    {
      "stepIndex": 0,
      "interventionIndex": 0,
      "indicatorKey": "frequence",
      "value": 1,
      "confidence": "high",
      "success": true
    },
    {
      "stepIndex": 0,
      "interventionIndex": 1,
      "indicatorKey": "ift",
      "value": 0,
      "confidence": "low",
      "success": false,
      "error": "Ephy API unavailable"
    }
    /* ... 13 more ... */
  ]
}
```

### Response (Error - 404)

```json
{
  "error": "SYSTEM_NOT_FOUND",
  "message": "System with ID '42' does not exist"
}
```

### Response (Error - 409)

```json
{
  "error": "CALCULATION_IN_PROGRESS",
  "message": "Another calculation is already running for this system"
}
```

---

## PATCH `/api/systems/:id` (Extended)

Existing endpoint extended to handle AI-related fields.

### Request

```typescript
{
  json: SystemData;  // Full system JSON with AI fields (assumptions, conversation, confidence)
}
```

**Example**:
```json
{
  "json": {
    "assumptions": "## Système\n\n- **Agriculture biologique**",
    "updatedAt": "2026-01-13T14:40:00Z",
    "steps": [
      {
        "id": "step1",
        "assumptions": "## Orge + Lupin\n\n- **Semences fermières**",
        "interventions": [
          {
            "id": "int1",
            "assumptions": "## Labour\n\n- **Tracteur 150 CV**",
            "values": [
              {
                "key": "mecanisation",
                "value": 130,
                "reviewed": true,
                "confidence": "medium",
                "conversation": [/* ... */]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Response (Success - 200)

```typescript
{
  success: boolean;
  system: System;  // Updated database record
}
```

**No new errors** - existing validation applies.

---

## Rate Limiting

All AI endpoints are rate-limited to prevent abuse and manage OpenAI costs:

- **Per user**: 30 requests/minute
- **Per system**: 10 calculations/minute
- **Batch endpoint**: 1 request/minute per system

### Rate Limit Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 1704988800
```

### Rate Limit Error (429)

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## Error Codes Summary

| Code | Error | Description |
|------|-------|-------------|
| 400 | `INVALID_INDICATOR` | Unknown indicator key |
| 400 | `INVALID_REQUEST` | Missing required fields |
| 400 | `EMPTY_MESSAGE` | User message is empty (refine endpoint) |
| 404 | `SYSTEM_NOT_FOUND` | System ID doesn't exist |
| 409 | `CALCULATION_IN_PROGRESS` | Concurrent calculation detected |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `CALCULATION_FAILED` | Internal error (OpenAI, database, etc.) |
| 500 | `EXTERNAL_API_ERROR` | Ephy/prix agricoles unavailable |

---

## Testing Examples

### cURL: Calculate Single Indicator

```bash
curl -X POST http://localhost:3000/api/ai/calculate-indicator \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "systemId": "42",
    "stepIndex": 0,
    "interventionIndex": 2,
    "indicatorKey": "mecanisation"
  }'
```

### cURL: Refine Value

```bash
curl -X POST http://localhost:3000/api/ai/refine-value \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "systemId": "42",
    "stepIndex": 0,
    "interventionIndex": 2,
    "indicatorKey": "mecanisation",
    "userMessage": "Le tracteur fait 120 CV, pas 150"
  }'
```

### cURL: Calculate All Missing

```bash
curl -X POST http://localhost:3000/api/ai/calculate-all-missing \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "systemId": "42"
  }'
```

---

## Versioning

**Current Version**: v1 (implicit in `/api/ai/*` paths)

**Future Versioning**: If breaking changes needed, use `/api/v2/ai/*` paths.

---

## Implementation Notes

1. All endpoints use Next.js API route handlers in `app/api/ai/`
2. Response times:
   - Single calculation: 2-10s (depends on indicator complexity)
   - Refinement: 2-5s (shorter, uses existing context)
   - Batch calculation: 10-60s (shows progress via separate mechanism)
3. Database transactions: Use existing `db.ts` connection pool
4. Error logging: All 500 errors logged to console with stack traces
5. OpenAI timeouts: 30s max per API call, then fallback to low-confidence default
