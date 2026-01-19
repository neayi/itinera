/**
 * Total Charges Indicator
 * Calculates total costs (sum of all expenses)
 */

import { BaseIndicator } from './base-indicator';

export class TotalChargesIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('totalCharges', context);
  }

  getFormattedValue(): string {
    const rawValue = this.getRawValue();
    
    if (rawValue === null || rawValue === undefined) {
      return '-';
    }
    
    if (this.getStatus() === 'n/a') {
      return 'N/A';
    }

    const numValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    
    if (isNaN(numValue) || numValue === 0) {
      return '-';
    }

    return `${Math.round(numValue)} €`;
  }

  getSystemPrompt(): string {
    return ''; // Not applicable as this is a direct calculation
  }

  getPrompt(): string {
    return ''; // Not applicable as this is a direct calculation
  }

  getLabel(): string {
    return 'Total charges';
  }
}
