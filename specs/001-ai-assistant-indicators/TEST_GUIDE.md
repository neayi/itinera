# Guide de Test - Assistant IA pour Indicateurs

## Prérequis

✅ Docker est lancé (`docker compose up -d`)
✅ Clé API OpenAI configurée dans `.env.local`
✅ Application accessible sur http://localhost:3000

## Comment tester les fonctionnalités

### 1. Accéder à un projet

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Cliquez sur un système de culture existant (ou créez-en un)
3. Vous devriez voir la table des interventions

### 2. Calculer un indicateur avec l'IA (US1)

Dans la table des interventions, cherchez des cellules vides dans les colonnes éditables comme :
- `frequence`
- `azoteMineral`
- `ges`
- etc.

**Vous devriez voir** :
- Un tiret `-` dans la cellule vide
- Un bouton **🤖** à côté

**Test** :
1. Cliquez sur le bouton 🤖
2. Attendez quelques secondes (calcul en cours : `...`)
3. La valeur calculée apparaît avec un badge de confiance :
   - 🟢 = Confiance élevée
   - 🟡 = Confiance moyenne
   - 🔴 = Confiance faible

**Exemple** : Pour une intervention "Labour", cliquez sur 🤖 dans la colonne `frequence` → L'IA devrait calculer `1` (une seule fois par an).

### 3. Voir l'historique de conversation (US2)

**Après avoir calculé une valeur avec l'IA** :

1. Cliquez sur la cellule qui contient la valeur calculée
2. Un panneau latéral s'ouvre à droite : **"Assistant IA"**
3. Vous voyez :
   - Le contexte (intervention, étape)
   - L'historique complet de la conversation
   - Les hypothèses prises par l'IA
   - Les étapes de calcul
   - Les sources utilisées
   - Le niveau de confiance

### 4. Raffiner une valeur via dialogue (US3)

**Dans le panneau Assistant IA ouvert** :

1. En bas du panneau, vous avez une zone de texte
2. Posez une question ou demandez un ajustement, par exemple :
   - "Quelle machine as-tu supposée ?"
   - "J'utilise un tracteur de 120 CV, pas 150 CV"
   - "Refais le calcul avec un labour à 4 socs"

3. Appuyez sur **Ctrl+Entrée** ou cliquez sur **📤 Envoyer**

4. L'IA répond, recalcule si nécessaire, et met à jour :
   - La valeur dans la table
   - La conversation avec le nouveau contexte
   - Le niveau de confiance

### 5. Édition manuelle

**Pour éditer manuellement une valeur** :

1. Cliquez sur une cellule vide (sans 🤖)
2. Le mode édition s'active (champ de saisie)
3. Entrez une valeur
4. Cliquez sur ✓ pour valider ou ✕ pour annuler

**Si la cellule avait une conversation IA** : Votre édition manuelle sera ajoutée à l'historique de conversation.

## Vérification rapide

### Checklist des éléments visibles :

- [ ] Bouton 🤖 sur les cellules vides
- [ ] Badges de confiance 🟢🟡🔴 sur les valeurs calculées
- [ ] Panneau latéral "Assistant IA" qui s'ouvre à droite
- [ ] Historique de conversation avec messages stylisés
- [ ] Zone de texte pour poser des questions
- [ ] Bouton "📤 Envoyer"

### Si vous ne voyez rien :

1. **Redémarrez Docker** pour prendre en compte `.env.local` :
   ```bash
   docker compose down
   docker compose up -d
   ```

2. **Vérifiez les logs Docker** :
   ```bash
   docker compose logs -f itinera
   ```

3. **Ouvrez la console navigateur** (F12) :
   - Cherchez des erreurs JavaScript
   - Vérifiez que `process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED` est `true`

4. **Vérifiez que vous êtes sur une page projet** :
   - L'URL devrait être : `http://localhost:3000/project/[id]`
   - La table InterventionsDataTable doit être visible

## Dépannage

### Le bouton 🤖 n'apparaît pas

- Vérifiez que la cellule est vraiment vide (valeur = 0 ou vide)
- Redémarrez Docker : `docker compose restart`
- Vérifiez `.env.local` : `NEXT_PUBLIC_AI_ASSISTANT_ENABLED=true`

### Erreur lors du calcul

- Vérifiez la clé API OpenAI dans `.env.local`
- Regardez les logs : `docker compose logs itinera | grep -i error`
- Vérifiez que la clé API est valide sur https://platform.openai.com/

### Le panneau ne s'ouvre pas

- Assurez-vous d'avoir cliqué sur une cellule avec une conversation existante
- Pour les cellules vides, utilisez le bouton 🤖 d'abord
- Vérifiez la console du navigateur pour des erreurs React

## Prochaines étapes

Une fois les US1-3 testées et validées, vous pouvez :
- Implémenter Phase 6 : Gestion hiérarchique des hypothèses
- Implémenter Phase 7 : 5 indicateurs supplémentaires
- Implémenter Phase 8 : Indicateurs de coûts
- Implémenter Phase 9 : Indicateurs techniques (IFT, EIQ)
- Implémenter Phase 10 : Calcul en masse

## Indicateur actuellement supporté

Pour le MVP, seul l'indicateur **`frequence`** est implémenté avec son prompt spécialisé.

Les autres indicateurs utilisent un prompt générique qui peut fonctionner mais sera moins précis.
