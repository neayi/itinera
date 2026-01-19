/**
 * Factory for creating indicator instances
 * 
 * Usage:
 * const indicator = IndicatorFactory.create('azoteOrganique', { systemData, stepIndex, interventionIndex });
 * const label = indicator.getLabel();
 * const value = indicator.getRawValue();
 * const formatted = indicator.getFormattedValue();
 * const prompt = indicator.getPrompt(context);
 */

/**
 * Indicator field key type
 * Used to identify which indicator is being accessed
 */
export type FieldKey = 
  | 'frequence'
  | 'azoteMineral'
  | 'azoteOrganique'
  | 'rendementTMS'
  | 'ift'
  | 'eiq'
  | 'ges'
  | 'tempsTravail'
  | 'coutsPhytos'
  | 'semences'
  | 'engrais'
  | 'mecanisation'
  | 'gnr'
  | 'irrigation'
  | 'totalProduits'
  | 'totalCharges'
  | 'prixVente'
  | 'margeBrute';

import { BaseIndicator, IndicatorContext } from './base-indicator';
import { FrequenceIndicator } from './frequence-indicator';
import { AzoteMineralIndicator } from './azote-mineral-indicator';
import { AzoteOrganiqueIndicator } from './azote-organique-indicator';
import { GesIndicator } from './ges-indicator';
import { TempsTravailIndicator } from './temps-travail-indicator';
import { RendementIndicator } from './rendement-indicator';
import { CoutsPhytosIndicator } from './couts-phytos-indicator';
import { SemencesIndicator } from './semences-indicator';
import { EngraisIndicator } from './engrais-indicator';
import { MecanisationIndicator } from './mecanisation-indicator';
import { GnrIndicator } from './gnr-indicator';
import { IrrigationIndicator } from './irrigation-indicator';
import { IftIndicator } from './ift-indicator';
import { EiqIndicator } from './eiq-indicator';
import { PrixVenteIndicator } from './prix-vente-indicator';
import { TotalChargesIndicator } from './total-charges-indicator';
import { TotalProduitsIndicator } from './total-produits-indicator';
import { MargeBruteIndicator } from './marge-brute-indicator';

export class IndicatorFactory {
  /**
   * Create an indicator instance for the given key
   * @param indicatorKey - The indicator code (e.g., 'azoteOrganique')
   * @param context - Optional context with systemData, stepIndex, interventionIndex
   * @returns Instance of the appropriate indicator class
   */
  static create(indicatorKey: string, context?: IndicatorContext): BaseIndicator {
    switch (indicatorKey) {
      case 'frequence':
        return new FrequenceIndicator(context);
      
      case 'azoteMineral':
        return new AzoteMineralIndicator(context);
      
      case 'azoteOrganique':
        return new AzoteOrganiqueIndicator(context);
      
      case 'ges':
        return new GesIndicator(context);
      
      case 'tempsTravail':
        return new TempsTravailIndicator(context);
      
      case 'rendementTMS':
        return new RendementIndicator(context);
      
      case 'coutsPhytos':
        return new CoutsPhytosIndicator(context);
      
      case 'semences':
        return new SemencesIndicator(context);
      
      case 'engrais':
        return new EngraisIndicator(context);
      
      case 'mecanisation':
        return new MecanisationIndicator(context);
      
      case 'gnr':
        return new GnrIndicator(context);
      
      case 'irrigation':
        return new IrrigationIndicator(context);
      
      case 'ift':
        return new IftIndicator(context);
      
      case 'eiq':
        return new EiqIndicator(context);
      
      case 'prixVente':
        return new PrixVenteIndicator(context);
      
      case 'totalCharges':
        return new TotalChargesIndicator(context);
      
      case 'totalProduits':
        return new TotalProduitsIndicator(context);
      
      case 'margeBrute':
        return new MargeBruteIndicator(context);
      
      default:
        throw new Error(`Unknown indicator key: ${indicatorKey}`);
    }
  }

}
