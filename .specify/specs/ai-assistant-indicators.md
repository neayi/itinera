# Spécification : Assistant IA pour le calcul des indicateurs d'interventions

## Vue d'ensemble

Un assistant IA contextuel qui aide les utilisateurs à calculer et affiner les valeurs des indicateurs pour chaque intervention agricole. L'assistant maintient un historique de conversation par cellule, stocké dans le JSON, et utilise des prompts spécialisés par type d'indicateur.

## Objectifs

1. **Automatisation intelligente** : Calculer automatiquement les valeurs des indicateurs en utilisant le contexte disponible
2. **Transparence** : Expliquer les hypothèses, sources et étapes de calcul
3. **Collaboration** : Permettre à l'utilisateur d'affiner les valeurs via dialogue
4. **Traçabilité** : Conserver l'historique complet des interactions et décisions
5. **Réutilisation** : Partager les hypothèses communes entre indicateurs d'une même intervention

## Architecture de données

### Hiérarchie des hypothèses (assumptions)

Les hypothèses sont stockées en **texte libre Markdown** à **trois niveaux** pour refléter la structure hiérarchique du système de culture.

**Format** : Chaque champ `assumptions` est une string contenant du markdown structuré.

#### 1. Niveau Système (racine)
Hypothèses globales qui s'appliquent à toute la rotation. Exemples :
```markdown
## Caractéristiques du système

- **Agriculture biologique** : Système conduit en AB, certifié Ecocert
- **Irrigation** : Goutte-à-goutte disponible, 3 tours max/an
- **Aire de captage** : Parcelles en zone vulnérable, restrictions phytos
- **Contrat** : Sous contrat Bonduelle pour petits pois
- **Label** : Zero-résidus-de-pesticides sur blé
- **ACS** : Agriculture de Conservation des Sols, TCS uniquement
```

#### 2. Niveau Step (production/étape)
Hypothèses spécifiques à une étape de la rotation. Exemples :
```markdown
## Orge + Lupin

- **Semences fermières** pour le lupin (plante compagne)
- **Export des pailles** à la récolte (vente)
- **Semis en ligne** avec semoir classique 3m
```

```markdown
## Sorgho dérobée

- **Broyage** du sorgho fin octobre, laissé au sol comme mulch
- **Semis à la volée** après moisson du blé
- **Pas d'irrigation** sur cette culture
```

#### 3. Niveau Intervention
Hypothèses spécifiques à une intervention. Exemples :
```markdown
## Désherbage blé

- **Fosbury à 5L/ha** en post-levée précoce (2-3 feuilles)
- Tracteur 120 CV + pulvérisateur 24m
```

```markdown
## Épandage digestat

- **Sans-tonne 12m³** (pas de pendillard)
- 30 m³/ha de digestat bovin
- Incorporation sous 4h (obligation réglementaire)
```

**Principe de cascade** : L'assistant IA doit :
1. **Lire** les assumptions des 3 niveaux (système → step → intervention) pour comprendre le contexte
2. **Compléter** le texte markdown au niveau approprié avec les nouvelles informations découvertes
3. **Maintenir** la cohérence entre niveaux (ex: bio au niveau système → pas de produits interdits en bio)
4. **Structurer** le texte de manière lisible (titres ##, listes à puces, **gras** pour les termes clés)
5. **Éviter les doublons** : ne pas répéter dans intervention ce qui est déjà au niveau système/step

### Extension de la structure JSON existante

```json
{
  "assumptions": "## Caractéristiques du système\n\n- **Agriculture biologique** : Le système est conduit en AB (confirmé par l'utilisateur)\n- **Non irrigué** : Pas d'irrigation disponible sur les parcelles\n- **Hors aire de captage** : Parcelles non situées en zone de captage d'eau potable\n- **Pas d'ACS** : Labour classique, pas d'Agriculture de Conservation des Sols\n",
  "updatedAt": "2026-01-12T09:00:00Z",
  "steps": [{
    "id": "step1",
    "name": "Orge + Lupin",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-07-20T00:00:00.000Z",
    "assumptions": "## Caractéristiques de l'étape Orge + Lupin\n\n- **Semences fermières** pour le lupin (plante compagne) - confirmé utilisateur\n- **Export des pailles** à la récolte\n- **Semis en ligne** avec semoir classique (pas de semis à la volée)\n",
    "updatedAt": "2026-01-12T09:30:00Z",
    "interventions": [{
      "id": "uuid",
      "name": "Labour",
      "description": "...",
      "assumptions": "## Hypothèses de calcul - Labour\n\n- **Matériel** : Tracteur 150 CV + combiné 5m (confirmé utilisateur)\n- **Travail du sol** : Combiné déchaumeur-herse rotative, largeur 5m\n- **Vitesse moyenne** : 8 km/h\n- **Consommation GNR** : ~12 L/ha\n",
      "updatedAt": "2026-01-12T10:30:00Z",
      "values": [
        {
          "key": "frequence",
          "value": 1,
          "reviewed": true,
          "conversation": [
            {
              "role": "system",
              "content": "Calcul de la fréquence pour l'intervention Labour...",
              "timestamp": "2026-01-12T10:30:00Z"
            },
            {
              "role": "assistant",
              "content": "Basé sur la description, cette intervention est effectuée une fois. Je propose une fréquence de 1.",
              "assumptions": ["description mentions 'labour' sans indication de répétition"],
              "sources": ["description de l'intervention"],
              "timestamp": "2026-01-12T10:30:01Z"
            },
            {
              "role": "user",
              "content": "Je confirme cette valeur",
              "timestamp": "2026-01-12T10:30:05Z"
            }
          ]
        },
        {
          "key": "mecanisation",
          "value": 130,
          "reviewed": true,
          "conversation": [
            {
              "role": "system",
              "content": "Calcul du coût de mécanisation pour Labour...",
              "timestamp": "2026-01-12T10:31:00Z"
            },
            {
              "role": "assistant",
              "content": "Pour un labour avec tracteur 150 CV et charrue 5 corps, j'estime:\n\n**Amortissement** : 45 €/ha\n- Coût charrue: 15000 € sur 10 ans, 300 ha/an\n- Coût tracteur (quote-part): 60000 € sur 12 ans, 600 ha/an\n\n**Charges fixes** : 30 €/ha\n- Assurances, hangar, frais financiers\n\n**Entretien** : 55 €/ha\n- Pièces d'usure (socs, versoirs)\n- Entretien tracteur proportionnel\n\n**Total** : 130 €/ha",
              "assumptions": [
                "Tracteur 150 CV, 45 L/ha",
                "Charrue 5 corps, largeur 2.5 m",
                "Vitesse moyenne 6 km/h"
              ],
              "calculation_steps": [
                "Surface/heure = 2.5 × 6 = 15 ha/h",
                "Temps = 1/15 = 0.067 h = 4 min",
                "Amortissement = (15000/3000 + 60000/7200) = 45 €/ha",
                "Charges fixes = 30 €/ha (barème Cerfrance)",
                "Entretien = 55 €/ha"
              ],
              "sources": [
                "Barème Cerfrance 2025",
                "Coûts moyens région Centre"
              ],
              "timestamp": "2026-01-12T10:31:02Z"
            },
            {
              "role": "user",
              "content": "La charrue n'a que 4 corps, pas 5",
              "timestamp": "2026-01-12T10:31:30Z"
            },
            {
              "role": "assistant",
              "content": "D'accord, je recalcule avec une charrue 4 corps:\n\n**Mise à jour** :\n- Largeur : 2.0 m (au lieu de 2.5 m)\n- Surface/heure : 2.0 × 6 = 12 ha/h\n- Temps : 5 min au lieu de 4 min\n- Coût tracteur légèrement augmenté\n\n**Nouveau total** : 145 €/ha",
              "assumptions": [
                "Charrue 4 corps, largeur 2.0 m"
              ],
              "timestamp": "2026-01-12T10:31:35Z"
            },
            {
              "role": "user",
              "content": "Je décide d'utiliser la valeur 150 €",
              "action": "manual_edit",
              "previous_value": 145,
              "new_value": 150,
              "timestamp": "2026-01-12T10:32:00Z"
            },
            {
              "role": "assistant",
              "content": "Pourquoi préférez-vous 150 € plutôt que mes 145 € ? Cela m'aiderait à affiner mes futurs calculs.",
              "timestamp": "2026-01-12T10:32:01Z"
            }
          ]
        }
      ]
    }]
  }]
}
```

## Composants à créer/modifier

### 1. Service IA : `/lib/ai/indicator-calculator.ts`

```typescript
interface CalculationContext {
  systemData: any;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
}

interface CalculationResult {
  value: number | string;
  conversation: ConversationMessage[];
  assumptionsMarkdown: string;  // Markdown à ajouter aux assumptions
  assumptionsLevel: 'system' | 'step' | 'intervention';  // Niveau cible
  sources: string[];
  calculationSteps?: string[];
}

class IndicatorCalculator {
  async calculateIndicator(context: CalculationContext): Promise<CalculationResult>
  async refineValue(context: CalculationContext, userMessage: string): Promise<CalculationResult>
  async calculateAllMissing(systemData: any): Promise<any>
}
```

### 2. Prompts par indicateur : `/lib/ai/prompts/`

Structure des fichiers :
- `frequence.ts` : Prompt pour calculer la fréquence
- `azote-mineral.ts` : Prompt pour azote minéral
- `azote-organique.ts` : Prompt pour azote organique
- `rendement.ts` : Prompt pour rendement TMS
- `ift.ts` : Prompt pour IFT (avec accès base Ephy)
- `eiq.ts` : Prompt pour EIQ (avec calcul matières actives)
- `ges.ts` : Prompt pour GES
- `temps-travail.ts` : Prompt pour temps de travail
- `couts-phytos.ts` : Prompt pour coûts phytos
- `semences.ts` : Prompt pour coûts semences
- `engrais.ts` : Prompt pour coûts engrais
- `mecanisation.ts` : Prompt pour coûts mécanisation
- `gnr.ts` : Prompt pour coûts GNR
- `irrigation.ts` : Prompt pour coûts irrigation
- `prix-vente.ts` : Prompt pour prix de vente

Chaque prompt inclut :
- Instructions spécifiques au calcul
- Format de sortie attendu
- Sources de données à utiliser
- Exemples de calculs
- **Contexte hiérarchique** :
  - Lire le markdown `system.assumptions` (bio, irrigué, labels, etc.)
  - Lire le markdown `step.assumptions` (semences, export, techniques, etc.)
  - Lire le markdown `intervention.assumptions` (produits, équipement, doses, etc.)
  - Parser les informations pertinentes pour le calcul
- **Instructions de maintenance** :
  - Enrichir le markdown au bon niveau avec nouvelles hypothèses
  - Format : `- **Terme clé** : Description détaillée (source)\n`
  - Détecter les incohérences en analysant le markdown des 3 niveaux
  - Ne pas dupliquer : vérifier si l'info existe déjà dans un niveau supérieur

### 3. Assistant IA (remplace ChatBot) : `/components/ai-assistant/`

**Structure du dossier :**
```
components/ai-assistant/
├── AIAssistant.tsx              # Composant principal (remplace ChatBot.tsx)
├── ConversationHistory.tsx      # Affichage historique messages
├── AssumptionsPanel.tsx         # Panneau hypothèses 3 niveaux (système/step/intervention)
├── CalculationProgress.tsx      # Indicateur progression calculs
├── MessageInput.tsx             # Saisie messages utilisateur
├── ai-assistant.scss            # Styles
└── index.ts                     # Exports
```

**Interface principale :**
```typescript
// AIAssistant.tsx
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
```

Nouvelles fonctionnalités :
- Afficher l'historique de conversation de la cellule focalisée
- Permettre d'envoyer des messages pour affiner
- Bouton "Recalculer" pour relancer le calcul
- Bouton "Calculer tout" pour lancer tous les calculs manquants
- Afficher les hypothèses partagées de l'intervention
- Mode compact vs étendu selon contexte

### 4. Modification EditableNumberCell

Ajouter :
- Au clic sur la cellule, mettre à jour le chat avec l'historique de cette cellule (mais garder le focus sur l'éditeur dans la cellule)
- Lors d'un changement manuel, ajouter message dans conversation

### 5. API Endpoints

#### POST `/api/ai/calculate-indicator`
```typescript
Request: {
  systemId: string;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
}
Response: {
  value: number | string;
  conversation: ConversationMessage[];
  updatedSystemData: any;
}
```

#### POST `/api/ai/refine-value`
```typescript
Request: {
  systemId: string;
  stepIndex: number;
  interventionIndex: number;
  indicatorKey: string;
  userMessage: string;
}
Response: {
  value: number | string;
  conversation: ConversationMessage[];
  updatedSystemData: any;
}
```

#### POST `/api/ai/calculate-all-missing`
```typescript
Request: {
  systemId: string;
}
Response: {
  calculatedCount: number;
  updatedSystemData: any;
  summary: Array<{
    stepIndex: number;
    interventionIndex: number;
    indicatorKey: string;
    value: number | string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}
```

## Détails des indicateurs

### Fréquence
- **Source** : Nom et description de l'intervention
- **Calcul** : Parsing du texte pour détecter "2 fois", "tous les 2 ans", etc.
- **Défaut** : 1
- **Hypothèses** : Aucune hypothèse nécessaire

### Azote Minéral / Organique
- **Source** : Description intervention, type engrais dans assumptions, cahier des charges dans le nom ou la description du système (bio, ab, ...)
- **Calcul** : Quantité × teneur en N
- **Hypothèses partagées** : Type engrais, formulation, quantité, cahier des charges (bio/conventionnel)
- **N/A si** : Pas d'apport d'engrais

### Rendement TMS
- **Source** : Description step/intervention, contexte pédoclimatique
- **Calcul** : Si mentionné → extraction. Sinon → moyenne régionale/culture/bio
- **Hypothèses** : Type de culture, cahier des charges (bio/conventionnel)
- **N/A si** : Intervention n'est pas récolte/moisson/fauche

### IFT
- **Source** : Base Ephy
- **Calcul** : Σ(quantité appliquée / dose max d'emploi)
- **API externe** : Base Ephy (https://ephy.anses.fr/)
- **Hypothèses partagées** : Liste produits, doses
- **N/A si** : Pas de produits phytos

### EIQ
- **Source** : Base Ephy, table EIQ
- **Calcul** : 
  1. Identifier matières actives (Ephy)
  2. Calculer quantité MA
  3. Appliquer coefficient EIQ par MA
- **Hypothèses partagées** : Liste produits, doses
- **N/A si** : Pas de produits phytos

### GES
- **Source** : Colonne GNR
- **Calcul** : Litres GNR × 3,15 kg CO2e/L (source: ADEME)
- **Hypothèses partagées** : Machine (consommation), Litres GNR

### Temps de travail
- **Source** : Type intervention, assumptions machine
- **Calcul** : 1 ha / (largeur × vitesse)
- **Hypothèses partagées** : Machine (largeur, vitesse)

### Coûts phytos
- **Source** : Base prix actuels
- **Calcul** : Σ(quantité × prix unitaire)
- **API externe** : Prix agricoles (Arvalis, Terre-net)
- **Hypothèses partagées** : Liste produits, doses

### Semences
- **Source** : Description step (variété), assumptions (densité)
- **Calcul** : Densité × prix/dose × cahier des charges (bio/conv)
- **Hypothèses** : Variété, densité, bio/conventionnel
- **N/A si** : Pas un semis

### Engrais
- **Source** : Assumptions (type engrais, quantité)
- **Calcul** : Quantité × prix/unité
- **API externe** : Prix agricoles
- **Hypothèses partagées** : Type, formulation, quantité
- **N/A si** : Pas d'apport engrais

### Mécanisation
- **Source** : Assumptions (machine)
- **Calcul** : 
  - Amortissement : Coût machine / (durée vie × surface annuelle)
  - Charges fixes : Assurance + hangar + financier (barème)
  - Entretien : Proportionnel usage (barème)
- **Sources** : Barème Cerfrance, Chambres d'Agriculture
- **Hypothèses partagées** : Machine (type, puissance, largeur, coût)

### GNR
- **Source** : Assumptions (machine, temps travail)
- **Calcul** : Temps × consommation/h × prix GNR
- **Hypothèses partagées** : Machine (consommation), temps travail, Litres GNR
- **Prix** : Prix actuel GNR (API ou défaut 1.10 €/L)

### Irrigation
- **Source** : Description intervention, contexte culture
- **Calcul** : Volume eau × coût/m³ + amortissement système
- **Hypothèses** : Volume, type système, coût eau
- **N/A si** : Pas d'irrigation dans le système (nom/description du système). Calculer cet indicateur uniquement si l'intervention est récolte/moisson/fauche

### Prix de vente
- **Source** : Type culture (step), cahier des charges (bio/conv)
- **Calcul** : Prix marché actuel × qualité
- **API externe** : Prix agricoles (FranceAgriMer)
- **N/A si** : Calculer cet indicateur uniquement si l'intervention est récolte/moisson/fauche

## Flux utilisateur

### Scénario 1 : Calcul automatique initial

1. Système détecte valeurs manquantes (`reviewed: undefined/false`)
2. Utilisateur clique "Calculer les valeurs manquantes"
3. Pour chaque cellule :
   - Récupérer contexte (step, intervention, assumptions)
   - Appeler IA avec prompt spécifique
   - IA retourne valeur + conversation + hypothèses
   - Sauvegarder dans JSON avec `reviewed: false`
   - Afficher cellule en jaune
4. Résumé des calculs effectués

### Scénario 2 : Affinage d'une valeur

1. Utilisateur clique cellule (revue ou non)
2. ChatBot s'ouvre avec historique de cette cellule
3. Assistant explique calcul initial
4. Utilisateur pose question : "Quelle machine as-tu utilisée ?"
5. Assistant répond avec détails des assumptions
6. Utilisateur : "J'utilise un tracteur de 120 CV, pas 150"
7. Assistant recalcule avec nouvelle hypothèse
8. Nouvelle valeur proposée
9. Utilisateur clique ✓ → `reviewed: true`, fond blanc

### Scénario 3 : Modification manuelle

1. Utilisateur clique cellule, entre valeur directement
2. Message auto-ajouté à conversation : "Je décide d'utiliser la valeur X"
3. `reviewed: true`
4. Assistant demande (dans conversation) pourquoi ce choix
5. Utilisateur peut répondre ou ignorer

### Scénario 4 : Recalcul après changement hypothèse

1. Utilisateur modifie hypothèse machine dans ChatBot
2. Système détecte que plusieurs indicateurs dépendent de cette hypothèse
3. Propose : "Recalculer mécanisation, GNR, temps travail, GES ?"
4. Si oui : Recalcul automatique, conversations mises à jour

### Scénario 5 : Maintenance des assumptions hiérarchiques

1. **Lors du calcul d'un indicateur**, l'IA :
   - Lit les assumptions système (bio, irrigué, etc.)
   - Lit les assumptions step (semences fermières, export paille, etc.)
   - Lit les assumptions intervention existantes
   - Utilise ces informations pour le calcul
   - Complète les assumptions manquantes détectées durant le calcul
   - Stocke les nouvelles assumptions au bon niveau

2. **Détection du niveau approprié** :
   - Si l'hypothèse concerne toute la rotation → niveau système
   - Si l'hypothèse concerne une étape entière → niveau step  
   - Si l'hypothèse est spécifique à cette intervention → niveau intervention

3. **Exemple concret** :
   - Utilisateur : "Je suis en bio"
   - IA détecte : hypothèse système
   - IA stocke : `system.assumptions.bio = { value: true, source: "user_confirmed" }`
   - IA propage : impact sur tous les calculs (prix semences, produits autorisés, etc.)

4. **Cohérence** :
   - Si conflit détecté (ex: produit interdit en bio alors que système.assumptions.bio = true)
   - IA signale l'incohérence et propose correction

## Sources de données externes

### Base Ephy (ANSES)
- URL : https://ephy.anses.fr/
- Usage : IFT, EIQ (matières actives)
- **Implémentation initiale** : Scraping HTML/recherche
- **Migration prévue** : MCP server pour accès structuré

### Prix agricoles
- Sources : Arvalis, Terre-net, FranceAgriMer, La France Agricole
- Usage : Phytos, semences, engrais, prix vente
- **Implémentation initiale** : Scraping + valeurs par défaut
- **Migration prévue** : MCP servers spécialisés par source

### Barèmes coûts
- Source : Cerfrance, Chambres d'Agriculture
- Usage : Mécanisation, GNR
- **Implémentation** : Tables statiques JSON actualisées annuellement
- Format : Fichiers dans `/lib/data/baremes/`

### Données pédoclimatiques
- Source : Meteo France, Sols de Bretagne/France
- Usage : Rendements par défaut
- Format : API

## Configuration

### Variables d'environnement (.env)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # ou gpt-4o pour plus de précision
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3  # Basse pour calculs déterministes

# Feature Flags
AI_ASSISTANT_ENABLED=true
AI_AUTO_CALCULATE=false  # Calcul auto au chargement
AI_MAX_CONVERSATIONS_LENGTH=10

# External Data Sources
EPHY_SCRAPING_ENABLED=true
EPHY_CACHE_TTL=86400  # 24h en secondes
PRIX_AGRICOLES_CACHE_TTL=3600  # 1h
```

## Contraintes techniques

### Performance
- Calculs séquentiels : Max 30s pour toute une rotation
- Calculs parallèles : Jusqu'à 5 indicateurs simultanés
- Cache des résultats intermédiaires (ex: données Ephy)

### Coûts IA
- Modèle principal : OpenAI GPT-4o-mini pour calculs standards (économique)
- Modèle avancé : GPT-4o pour calculs complexes (IFT, EIQ) nécessitant précision
- Limiter longueur conversations (max 10 échanges par cellule)
- Résumer anciennes conversations si dépassement
- Configurable via variable d'environnement `OPENAI_MODEL`

### UX
- Indicateur de progression pour calcul multiple
- Possibilité d'annuler calcul en cours
- Preview avant validation collective
- Undo/Redo pour modifications

## Plan de développement

### Phase 1 : Infrastructure (2-3 jours)
- [ ] Étendre structure JSON (assumptions en texte libre markdown aux 3 niveaux : système/step/intervention, conversation)
- [ ] Service IndicatorCalculator de base avec OpenAI
- [ ] Configuration `.env` (OPENAI_API_KEY)
- [ ] Créer structure `/components/ai-assistant/`
- [ ] Composant AIAssistant.tsx de base (remplace ChatBot.tsx)
- [ ] API endpoints CRUD pour conversations
- [ ] Migration données existantes

### Phase 2 : Sous-composants AIAssistant (ConversationHistory, MessageInput)
- [ ] Intégration AIAssistant avec ProjectDetails.tsx(3-4 jours)
- [ ] Prompts pour fréquence, temps travail
- [ ] Calcul GES basique (via GNR)
- [ ] Intégration ChatBot avec historique
- [ ] Tests avec 2-3 indicateurs

### Phase 3 : Calculs complexes (5-6 jours)
- [ ] Intégration base Ephy (IFT, EIQ)
- [ ] Calculs mécanisation (barèmes)
- [ ] Calculs coûts (semences, engrais, phytos)
- [ ] Prix de vente (API prix)

### Phase 4 : AssumptionsPanel pour hypothèses partagées
- [ ] CalculationProgress pour calculs multiples
- [ ] Interface affinage valeurs
- [ ] Calcul multiple avec progression
- [ ] Preview et validation collective
- [ ] Icône 🤖 dans EditableNumberCell pour ouvrir assistant
- [ ] Preview et validation collective

### Phase 5 : Optimisation (2-3 jours)
- [ ] Cache et performance
- [ ] Gestion erreurs et fallbacks
- [ ] Documentation utilisateur
- [ ] Tests utilisateurs

**Total estimé : 15-20 jours de développement**

## Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| API Ephy indisponible/changeante | Haut | Scraping + cache local, fallback sur moyennes |
| Coûts IA élevés | Moyen | Modèles économiques, limite conversations |
| Calculs imprécis | Haut | Transparence totale, validation utilisateur |
| JSON trop volumineux | Moyen | Compression conversations anciennes |
| Temps calcul trop long | Moyen | Parallélisation, cache, indicateur progression |

## Métriques de succès

- **Adoption** : 80% des utilisateurs utilisent l'assistant pour ≥ 5 cellules
- **Précision** : 70% des valeurs proposées acceptées sans modification
- **Efficacité** : Temps de remplissage divisé par 3
- **Confiance** : 90% des valeurs finales marquées `reviewed: true`
- **Engagement** : Moyenne 2-3 échanges par cellule avec assistant

## Questions ouvertes

### Décisions prises

1. **✅ Modèle IA** : OpenAI (GPT-4o ou GPT-4o-mini selon besoins précision/coût)
   - Clé API stockée dans `.env` : `OPENAI_API_KEY`
   - Architecture permettant ajout d'autres modèles ultérieurement
   
2. **✅ Accès bases externes** : Scraping pour démarrage rapide
   - Migration vers MCP (Model Context Protocol) prévue pour données précises/actualisées
   - Abstraire l'accès via interfaces pour faciliter migration
   
3. **✅ Persistence conversations** : JSON pour commencer
   - Migration vers table séparée si problèmes de performance constatés
   - Prévoir système de compression/archivage si conversations trop volumineuses

### À décider plus tard

4. **Validation collective** : Permettre validation en masse après preview ?
5. **Multilangue** : Support anglais/espagnol pour prompts ?
6. **Historique versions** : Garder trace des recalculs successifs ?
7. **Export** : Permettre export des conversations en PDF/rapport ?
