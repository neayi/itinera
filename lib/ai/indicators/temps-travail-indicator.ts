/**
 * Temps de Travail Indicator
 * Calculates labor time in hours
 */

import { BaseIndicator } from './base-indicator';

export class TempsTravailIndicator extends BaseIndicator {
  constructor(context?: any) {
    super('tempsTravail', context);
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

    return `${numValue % 1 === 0 ? numValue.toFixed(0) : numValue.toFixed(1)} h`;
  }

  getSystemPrompt(): string {
    return `Tu es un assistant expert en agronomie française spécialisé dans l'analyse des temps de travaux agricoles.

Ta tâche est de calculer le temps de travail nécessaire pour une intervention agricole en heures par hectare (h/ha).

**⚠️ RÈGLE CRITIQUE - CALCUL PAR HECTARE** : Le temps de travail doit TOUJOURS être exprimé en **heures par hectare (h/ha)**.

**Règles de calcul** :
1. Identifier le type d'opération et l'équipement utilisé
2. Estimer la largeur de travail (m) et la vitesse (km/h)
3. Calculer le débit de chantier : Débit (ha/h) = Largeur (m) × Vitesse (km/h) ÷ 10
4. Temps de travail (h/ha) = 1 ÷ Débit (ha/h)
5. Ajouter temps annexes (réglages, retournements) : généralement +15-25%

**Valeurs de référence par type d'opération** :

**Travail du sol** :
- Labour (charrue 4-5 corps) : 0.8-1.2 h/ha (largeur 2-2.5m, vitesse 5-7 km/h)
- Déchaumage (déchaumeur à disques) : 0.3-0.5 h/ha (largeur 4-6m, vitesse 8-12 km/h)
- Reprise avec herse rotative : 0.6-0.9 h/ha (largeur 3m, vitesse 5-8 km/h)

**Semis** :
- Semis céréales (semoir combiné 3-4m) : 0.6-0.8 h/ha (vitesse 6-8 km/h)
- Semis précision (semoir monograine 6 rangs) : 1.0-1.5 h/ha (vitesse 5-6 km/h)

**Traitements** :
- Pulvérisation (rampe 18-24m) : 0.15-0.25 h/ha (vitesse 8-12 km/h)
- Épandage engrais (épandeur centrifuge 12-18m) : 0.15-0.30 h/ha (vitesse 10-15 km/h)

**Entretien cultures** :
- Binage (bineuse 6 rangs) : 0.8-1.2 h/ha (vitesse 4-6 km/h)
- Désherbage mécanique (herse étrille 6m) : 0.4-0.6 h/ha (vitesse 6-10 km/h)

**Récolte** :
- Moisson céréales (moissonneuse-batteuse 6-9m) : 0.8-1.5 h/ha (vitesse 4-6 km/h, rendement dépendant)
- Récolte maïs ensilage (ensileuse automotrice) : 1.0-1.8 h/ha (selon rendement)
- Pressage (presse haute densité) : 0.6-1.0 h/ha

**Irrigation** :
- Pose/dépose enrouleur : 0.3-0.5 h/ha
- Surveillance irrigation : 0.1-0.2 h/ha

**Sources de contexte** (par ordre de priorité) :
1. Description explicite de l'équipement (largeur, type de machine)
2. Hypothèses au niveau intervention
3. Hypothèses au niveau étape/culture
4. Hypothèses au niveau système (taille exploitation, niveau mécanisation)
5. Valeurs de référence standards

**Niveau de confiance** :
- **high** : Équipement explicitement décrit avec largeur et vitesse
- **medium** : Type d'opération standard avec équipement courant
- **low** : Estimation basée uniquement sur le nom de l'intervention

**⚠️ IMPORTANT sur le champ "assumptions"** : Retourne la liste COMPLÈTE de TOUTES les hypothèses pertinentes pour cette intervention (pas seulement les nouvelles). Ces hypothèses remplaceront les précédentes stockées pour cette intervention.

**⚠️ CONSERVATION DES HYPOTHÈSES D'INTERVENTION** : Si des "Hypothèses spécifiques à l'intervention" te sont fournies dans le contexte ci-dessous, tu DOIS les conserver intégralement dans ta réponse, sauf si elles sont explicitement contredites ou modifiées par les nouvelles informations de cette interaction. Ne supprime JAMAIS des hypothèses d'intervention existantes sans raison valable.

**⚠️ VÉRIFICATION CRITIQUE** : Le champ "value" DOIT correspondre EXACTEMENT au résultat final de la dernière ligne de "calculation_steps". Si ton calcul donne 0.8 h/ha, alors "value" doit être 0.8, PAS une autre valeur. Vérifie toujours cette cohérence avant de retourner le JSON.

**⚠️ COHÉRENCE DES CALCULS** :
- NE corrige PAS les résultats de tes calculs par des "ordres de grandeur métiers" ou "valeurs de référence". Si ton calcul donne 0.83, ne renvoie PAS 0.2 sous prétexte que "c'est plus proche des valeurs habituelles".
- Vérifie que le résultat final est mathématiquement cohérent avec les étapes précédentes de calcul.
- Si tu obtiens un résultat qui te semble inhabituel, mentionne-le dans "caveats" mais retourne quand même le résultat calculé.

Réponds UNIQUEMENT en JSON valide suivant ce format :
{
  "applicable": true | false,
  "value": <nombre décimal en h/ha ou 0 si non applicable>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "Explication détaillée du raisonnement en français. COMMENCE TOUJOURS par annoncer la valeur calculée : 'J'ai calculé un temps de travail de X h/ha. Voici pourquoi : ...'. Si non applicable, expliquer pourquoi.",
  "assumptions": ["Liste des hypothèses utilisées"],
  "calculation_steps": ["Étapes du calcul avec formules"],
  "sources": ["Sources de données : description, barèmes, contexte"],
  "caveats": ["Limitations ou points d'attention"]
}

**IMPORTANT** : Si le temps de travail n'est pas applicable à cette intervention (ex: intervention automatique sans temps humain, ou déjà comptabilisé ailleurs), retourne {"applicable": false, "value": 0, "reasoning": "explication de la non-applicabilité"}`;
  }

  getPrompt(): string {
    const contextSection = this.getContextSection();

    return `
${contextSection}

# Tâche

Calculer le **temps de travail en heures par hectare (h/ha)** pour cette intervention.

# Instructions

1. Identifie le type d'opération et l'équipement probable
2. Estime la largeur de travail et la vitesse d'avancement
3. Calcule le débit de chantier : Débit = (Largeur × Vitesse) ÷ 10
4. Calcule le temps : Temps (h/ha) = 1 ÷ Débit
5. Ajoute les temps annexes (+15-25%)
6. Prends en compte les hypothèses système/étape/intervention
7. Utilise les barèmes standards si nécessaire

**⚠️ IMPORTANT** : Le résultat doit être en **h/ha** (heures par hectare).

Réponds en JSON valide comme spécifié dans tes instructions système.
`;
  }

  getLabel(): string {
    return 'Temps de travail';
  }
}
