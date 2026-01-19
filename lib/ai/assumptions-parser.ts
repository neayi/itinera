/**
 * Utility functions for parsing and managing assumptions in markdown format
 * 
 * Assumptions are stored as markdown text at 3 levels:
 * - System level: systemData.assumptions
 * - Step level: step.assumptions
 * - Intervention level: intervention.assumptions
 */

export interface ParsedAssumption {
  text: string;
  category?: string; // e.g., "Caractéristiques du système", "Orge + Lupin"
}

/**
 * Parse markdown assumptions text into structured list
 * Extracts bullet points and their context
 * @param markdown - Can be a string (old format) or string[] (new format)
 */
export function parseAssumptionsMarkdown(markdown: string | string[] | undefined): ParsedAssumption[] {
  if (!markdown) {
    return [];
  }

  // Convert to string format for processing
  let markdownText: string;
  if (Array.isArray(markdown)) {
    // New format: array of assumptions
    markdownText = markdown.map(a => `- ${a}`).join('\n');
  } else {
    // Old format: markdown string
    markdownText = markdown;
  }

  if (markdownText.trim() === '') {
    return [];
  }

  const assumptions: ParsedAssumption[] = [];
  const lines = markdownText.split('\n');
  let currentCategory: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect category headers (## Title)
    if (trimmed.startsWith('##')) {
      currentCategory = trimmed.replace(/^##\s*/, '').trim();
      continue;
    }

    // Extract bullet points (- text or * text)
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      
      // Remove markdown bold markers (**text**)
      const cleanText = text.replace(/\*\*(.+?)\*\*/g, '$1');
      
      assumptions.push({
        text: cleanText,
        category: currentCategory,
      });
    }
  }

  return assumptions;
}

/**
 * Format assumptions list back to markdown
 */
export function formatAssumptionsToMarkdown(
  assumptions: ParsedAssumption[],
  title?: string
): string {
  if (assumptions.length === 0) {
    return '';
  }

  let markdown = '';
  
  if (title) {
    markdown += `## ${title}\n\n`;
  }

  // Group by category
  const grouped = new Map<string | undefined, ParsedAssumption[]>();
  for (const assumption of assumptions) {
    const cat = assumption.category;
    if (!grouped.has(cat)) {
      grouped.set(cat, []);
    }
    grouped.get(cat)!.push(assumption);
  }

  // Write each group
  for (const [category, items] of grouped.entries()) {
    if (category && category !== title) {
      markdown += `### ${category}\n\n`;
    }
    
    for (const item of items) {
      markdown += `- ${item.text}\n`;
    }
    
    markdown += '\n';
  }

  return markdown.trim();
}

/**
 * Merge system, step, and intervention assumptions into a single context
 * Used for AI prompts
 */
export function buildAssumptionsContext(
  systemAssumptions?: string | string[],
  stepAssumptions?: string | string[],
  interventionAssumptions?: string | string[]
): string {
  const parts: string[] = [];

  // Convert to string if needed
  const systemText = Array.isArray(systemAssumptions) 
    ? systemAssumptions.join('\n') 
    : systemAssumptions;
  const stepText = Array.isArray(stepAssumptions) 
    ? stepAssumptions.join('\n') 
    : stepAssumptions;
  const interventionText = Array.isArray(interventionAssumptions) 
    ? interventionAssumptions.join('\n') 
    : interventionAssumptions;

  if (systemText && systemText.trim()) {
    parts.push(`### Hypothèses système\n\n${systemText}`);
  }

  if (stepText && stepText.trim()) {
    parts.push(`### Hypothèses étape\n\n${stepText}`);
  }

  if (interventionText && interventionText.trim()) {
    parts.push(`### Hypothèses intervention\n\n${interventionText}`);
  }

  if (parts.length === 0) {
    return 'Aucune hypothèse définie.';
  }

  return parts.join('\n\n');
}

/**
 * Check if assumption already exists in markdown to avoid duplication
 */
export function assumptionExists(markdown: string | string[] | undefined, assumptionText: string): boolean {
  if (!markdown) return false;
  
  const parsed = parseAssumptionsMarkdown(markdown);
  const normalizedSearch = assumptionText.toLowerCase().trim();
  
  return parsed.some(a => 
    a.text.toLowerCase().includes(normalizedSearch) ||
    normalizedSearch.includes(a.text.toLowerCase())
  );
}

/**
 * Add new assumption to markdown, avoiding duplicates
 */
export function addAssumption(
  existingMarkdown: string | string[] | undefined,
  newAssumption: string,
  category?: string
): string {
  // Check for duplicates
  if (assumptionExists(existingMarkdown, newAssumption)) {
    const text = Array.isArray(existingMarkdown) 
      ? existingMarkdown.join('\n') 
      : (existingMarkdown || '');
    return text;
  }

  const parsed = parseAssumptionsMarkdown(existingMarkdown);
  
  parsed.push({
    text: newAssumption,
    category,
  });

  return formatAssumptionsToMarkdown(parsed, category);
}

/**
 * Detect conflicts between assumptions at different levels
 * Returns list of conflicts found
 */
export function detectConflicts(
  systemAssumptions?: string | string[],
  stepAssumptions?: string | string[],
  interventionAssumptions?: string | string[]
): string[] {
  const conflicts: string[] = [];

  const system = parseAssumptionsMarkdown(systemAssumptions);
  const step = parseAssumptionsMarkdown(stepAssumptions);
  const intervention = parseAssumptionsMarkdown(interventionAssumptions);

  // Check for contradicting keywords
  const conflictKeywords = [
    ['bio', 'conventionnel'],
    ['irrigué', 'non irrigué', 'sec'],
    ['semences fermières', 'semences certifiées'],
    ['labour', 'non labour', 'tcs', 'techniques culturales simplifiées'],
  ];

  const allAssumptions = [
    ...system.map(a => ({ ...a, level: 'système' as const })),
    ...step.map(a => ({ ...a, level: 'étape' as const })),
    ...intervention.map(a => ({ ...a, level: 'intervention' as const })),
  ];

  for (const keywords of conflictKeywords) {
    const found = new Map<string, { text: string; level: string }>();
    
    for (const assumption of allAssumptions) {
      const lowerText = assumption.text.toLowerCase();
      
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          found.set(keyword, { text: assumption.text, level: assumption.level });
        }
      }
    }

    // If we found conflicting keywords
    if (found.size > 1) {
      const entries = Array.from(found.entries());
      conflicts.push(
        `Conflit détecté : ${entries.map(([kw, info]) => 
          `"${kw}" (niveau ${info.level}: ${info.text})`
        ).join(' vs ')}`
      );
    }
  }

  return conflicts;
}
