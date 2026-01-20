/**
 * Base abstract class for all indicators
 * Each indicator inherits from this class and implements specific methods
 */

import { ColumnDef } from '@tanstack/react-table';
import { InterventionRow } from '@/components/interventions-table/types';
import { buildContextSection } from './utils';

export type IndicatorStatus = undefined | 'user' | 'calculated' | 'ia' | 'n/a';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Import FieldKey from factory to avoid circular dependency issues
import type { FieldKey } from './indicator-factory';

/**
 * Context provided to each indicator instance
 */
export interface IndicatorContext {
    systemData?: any;
    stepIndex?: number;
    interventionIndex?: number;
}

/**
 * Abstract base class for all indicators
 */
export abstract class BaseIndicator {
    protected key: string;
    protected systemData?: any;
    protected stepIndex?: number;
    protected interventionIndex?: number;

    constructor(key: string, context?: IndicatorContext) {
        this.key = key;
        this.systemData = context?.systemData;
        this.stepIndex = context?.stepIndex;
        this.interventionIndex = context?.interventionIndex;
    }

    /**
     * Get the indicator key (e.g., 'azoteOrganique')
     */
    getKey(): string {
        return this.key;
    }

    /**
     * Get the system prompt for AI calculations
     * @returns System prompt string for this indicator
     */
    abstract getSystemPrompt(): string;

    /**
     * Get the user prompt for AI calculations
     * All context is extracted from class properties (systemData, stepIndex, interventionIndex)
     * @returns User prompt string for this indicator
     */
    abstract getPrompt(): string;

    /**
     * Get the raw numeric value for this indicator
     * Works at intervention level (if interventionIndex is provided) or step level (if not)
     * @returns Raw value as number, null if not set, or not applicable
     */
    getRawValue(): number | null {
        if (!this.systemData || this.stepIndex === undefined) {
            return null;
        }

        const step = this.systemData.steps?.[this.stepIndex];

        if (!step) {
            return null;
        }

        let valueEntry = null;

        if (this.interventionIndex !== undefined) {
            // If interventionIndex is provided, look in intervention.values
            const intervention = step.interventions?.[this.interventionIndex];

            if (!intervention || !intervention.values) {
                return null;
            }

            valueEntry = intervention.values.find((v: any) => v.key === this.key);

        } else if (step.values) {

            // If no interventionIndex, look in step.values
            valueEntry = step.values.find((v: any) => v.key === this.key);
        }

        if (!valueEntry) {
            return null;
        }

        // Handle N/A case
        if (valueEntry.status === 'n/a') {
            return null;
        }

        return typeof valueEntry.value === 'string' ? parseFloat(valueEntry.value) : valueEntry.value;
    }

    /** Returns the weighted value for this indicator, with frequency applied if applicable (1 by default), and always returns a number (0 if not applicable)
     *
     * @returns Weighted numeric value
     */
    getWeightedValue(): number {
        const rawValue = this.getRawValue();
        if (rawValue === null || rawValue === undefined || isNaN(rawValue)) {
            return 0;
        }

        let frequency = 1;

        // Apply frequency multiplier if available at intervention level
        if (this.systemData && this.stepIndex !== undefined && this.interventionIndex !== undefined) {
            const step = this.systemData.steps?.[this.stepIndex];
            const intervention = step?.interventions?.[this.interventionIndex];

            if (intervention && intervention.values) {
                const freqEntry = intervention.values.find((v: any) => v.key === 'frequence');
                frequency = freqEntry?.value || 1;
            }
        }

        return rawValue * frequency;
    }

    /**
     * Get the formatted value for display (with units)
     * Each indicator must implement its own formatting logic
     * @returns Formatted string value
     */
    abstract getFormattedValue(): string;

    /**
     * Format a value with its unit and /ha suffix if applicable
     * This version adds /ha suffix for per-hectare indicators to be explicit in prompts
     * @param value - The value to format
     * @returns Formatted string value with /ha suffix if applicable
     */
    formatIndicatorValue(): string {
        const baseFormatted = this.getFormattedValue();

        // For per-hectare indicators, add /ha if not already present
        if (this.isPerHectare() && baseFormatted !== '-' && !baseFormatted.includes('/ha')) {
            return baseFormatted + '/ha';
        }

        return baseFormatted;
    }

    /**
     * Get the status of this indicator
     * Works at intervention level (if interventionIndex is provided) or step level (if not)
     * @returns Status: undefined | 'user' | 'calculated' | 'ia' | 'n/a'
     */
    getStatus(): IndicatorStatus {
        if (!this.systemData || this.stepIndex === undefined) {
            return undefined;
        }

        const step = this.systemData.steps?.[this.stepIndex];

        if (!step) {
            return undefined;
        }

        let valueEntry;

        // If interventionIndex is provided, look in intervention.values
        if (this.interventionIndex !== undefined) {
            const intervention = step.interventions?.[this.interventionIndex];

            if (!intervention || !intervention.values) {
                return undefined;
            }

            valueEntry = intervention.values.find((v: any) => v.key === this.key);
        } else {
            // If no interventionIndex, look in step.values
            if (!step.values) {
                return undefined;
            }

            valueEntry = step.values.find((v: any) => v.key === this.key);
        }

        if (!valueEntry) {
            return undefined;
        }

        // Check status field if present
        if (valueEntry.status) {
            const status = valueEntry.status;

            // Return as-is if already compatible: 'user' | 'calculated' | 'ia' | 'n/a'
            return status as IndicatorStatus;
        }

        // Default to undefined if value exists but no status (entered by user)
        return undefined;
    }

    /**
     * Get the column definition for TanStack Table
     * @returns Column definition ready to use
     */
    getColumnHeader(): ColumnDef<InterventionRow> {
        return {
            accessorKey: this.key,
            header: this.getLabel(),
            cell: (info) => this.getFormattedValue(),
            meta: { align: 'center', editable: true, fieldType: 'number' },
        } as ColumnDef<InterventionRow>;
    }

    /**
     * Get the human-readable label for this indicator
     * Must be overridden by subclasses
     * @returns Label string
     */
    getLabel(): string {
        return this.key;
    }

    /**
     * Check if this indicator should be expressed per hectare
     * @returns true by default (can be overridden by subclasses)
     */
    isPerHectare(): boolean {
        return true;
    }

    /**
     * Check if this indicator is applicable to the given intervention
     * Can be overridden by subclasses to implement specific logic
     * @param intervention - The intervention to check
     * @returns true if applicable, false otherwise
     */
    isApplicable(intervention: any): boolean {
        // Default: all indicators are applicable
        // Subclasses can override this method
        return true;
    }

    /**
     * Get the context section for prompts
     * Uses the shared buildContextSection utility function
     * @returns Formatted context string
     */
    protected getContextSection(): string {
        if (!this.systemData || this.stepIndex === undefined || this.interventionIndex === undefined) {
            return '';
        }

        return buildContextSection(
            this.key,
            this.systemData,
            this.stepIndex,
            this.interventionIndex
        );
    }
}
