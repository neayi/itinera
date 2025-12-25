-- Insert sample data based on ItineraryList.tsx
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE itinera_db;

-- Insert users (farmers)
INSERT INTO users (name, email) VALUES
    ('Jean Dupont', 'jean.dupont@example.com'),
    ('Marie Martin', 'marie.martin@example.com'),
    ('Pierre Legrand', 'pierre.legrand@example.com'),
    ('Sophie Bernard', 'sophie.bernard@example.com'),
    ('Luc Moreau', 'luc.moreau@example.com'),
    ('Claire Petit', 'claire.petit@example.com'),
    ('Thomas Robert', 'thomas.robert@example.com'),
    ('Emma Dubois', 'emma.dubois@example.com');

-- Insert farms
INSERT INTO farms (name, farmer_name, gps_location, town) VALUES
    ('EARL Dupont', 'Jean Dupont', '43.6047,1.4442', 'Toulouse'),
    ('GAEC Martin', 'Marie Martin', '43.9297,2.1480', 'Albi'),
    ('SCEA Legrand', 'Pierre Legrand', '43.6053,2.2525', 'Castres'),
    ('Les Jardins de Sophie', 'Sophie Bernard', '43.8951,3.2820', 'Montpellier'),
    ('Ferme de la Vallée', 'Luc Moreau', '45.7640,4.8357', 'Lyon'),
    ('Domaine Bio Claire', 'Claire Petit', '47.2184,1.5536', 'Tours'),
    ('Exploitation Robert', 'Thomas Robert', '48.8566,2.3522', 'Paris'),
    ('Ferme Emma', 'Emma Dubois', '44.8378,0.5792', 'Bordeaux');

-- Insert systems (itineraries) with full rotation data
INSERT INTO systems (farm_id, name, description, system_type, productions, json) VALUES
(1, 'Rotation Bio 2027-2033',
 'Rotation agroécologique sur 7 ans avec cultures associées, digestat et réduction EIQ. Objectif : transition vers AB et amélioration des marges.',
 'Bio',
 'Blé,Orge,Luzerne,Quinoa,Colza,Maïs',
 '{
   "title": "Rotation Bio 2027-2033",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "title_top_interventions": "Cultures principales",
     "title_bottom_interventions": "Couverts et CIVE",
     "title_steps": "Rotation",
     "region": "France",
     "show_climate_diagram": true,
     "climate_data": {
       "temperatures": [7.5, 7.3, 8.9, 10.8, 13.4, 16.4, 17.8, 18, 16.7, 14.5, 11, 8.3],
       "precipitations": [82, 60, 54, 50, 52, 32, 38, 33, 56, 77, 78, 85]
     }
   },
   "steps": [
     {
       "startDate": "2026-03-01T00:00:00.000Z",
       "id": "step1",
       "name": "Orge + Lupin",
       "color": "#d2b48c",
       "endDate": "2026-07-20T00:00:00.000Z",
       "description": "Lupin (350 kg/ha) + Orge (50 kg/ha) dans la ligne de semis après un labour. Rendement orge : 14,25 qx/ha, Rendement lupin : 10,25 qx/ha",
       "interventions": [
         {"id": "i1", "day": "-5", "name": "Labour", "type": "intervention_top", "description": ""},
         {"id": "i2", "day": "141", "name": "Fauche, andainage puis récolte", "type": "intervention_top", "description": "Récolte avec broyage des pailles une semaine après la fauche."}
       ],
       "secondary_crop": false,
       "duration": 5
     },
     {
       "startDate": "2026-07-20T00:00:00.000Z",
       "id": "step2",
       "name": "Luzerne + trèfle violet et blanc",
       "color": "#2d9f6e",
       "endDate": "2028-10-15T00:00:00.000Z",
       "description": "Semis à la volée avec le combiné. Rendement luzerne : 12 tMS/ha",
       "interventions": [
         {"id": "i3", "day": "299", "name": "Digestat", "type": "intervention_bottom", "description": "Epandage de digestat 20m³/ha"}
       ],
       "secondary_crop": false,
       "duration": 27
     }
   ]
 }'),

(2, 'Système Grandes Cultures TCS',
 'Système de grandes cultures en agriculture de conservation avec couverts végétaux et désherbage mécanique.',
 'TCS',
 'Blé,Colza,Orge',
 '{
   "title": "Système TCS Grandes Cultures",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "region": "France",
     "show_climate_diagram": false
   },
   "steps": [
     {
       "startDate": "2026-10-01T00:00:00.000Z",
       "id": "tcs1",
       "name": "Blé tendre",
       "color": "#d2b48c",
       "endDate": "2027-07-15T00:00:00.000Z",
       "description": "Blé tendre en TCS après déchaumage superficiel. Rendement : 68 qx/ha",
       "interventions": [
         {"id": "ti1", "day": "-5", "name": "Déchaumage", "type": "intervention_top", "description": ""},
         {"id": "ti2", "day": "0", "name": "Semis direct", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 9
     }
   ]
 }'),

(3, 'Polyculture-Élevage Intégré',
 'Système polyculture-élevage avec autonomie fourragère, valorisation des effluents et rotation longue.',
 'HVE',
 'Maïs,Luzerne,Prairie,Blé',
 '{
   "title": "Polyculture-Élevage",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "region": "France",
     "show_climate_diagram": true,
     "climate_data": {
       "temperatures": [6.5, 7.0, 9.5, 12.0, 15.5, 18.5, 20.0, 19.5, 17.0, 13.5, 9.5, 7.0],
       "precipitations": [90, 70, 60, 55, 60, 45, 50, 45, 65, 85, 90, 95]
     }
   },
   "steps": [
     {
       "startDate": "2026-04-01T00:00:00.000Z",
       "id": "pe1",
       "name": "Maïs ensilage",
       "color": "#ffd700",
       "endDate": "2026-09-30T00:00:00.000Z",
       "description": "Maïs ensilage pour l\'élevage. Rendement : 14 tMS/ha",
       "interventions": [
         {"id": "pei1", "day": "0", "name": "Labour", "type": "intervention_top", "description": ""},
         {"id": "pei2", "day": "150", "name": "Récolte ensilage", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 6
     },
     {
       "startDate": "2026-10-01T00:00:00.000Z",
       "id": "pe2",
       "name": "Prairie temporaire",
       "color": "#4caf50",
       "endDate": "2029-10-01T00:00:00.000Z",
       "description": "Prairie temporaire 3 ans pour l\'autonomie fourragère",
       "interventions": [],
       "secondary_crop": false,
       "duration": 36
     }
   ]
 }'),

(4, 'Maraîchage Diversifié Bio',
 'Production maraîchère diversifiée en AB sur sol vivant avec paillage et irrigation goutte à goutte.',
 'Bio',
 'Tomate,Salade,Courgette,Haricot',
 '{
   "title": "Maraîchage Bio Diversifié",
   "options": {
     "view": "vertical",
     "show_transcript": true,
     "region": "France"
   },
   "steps": [
     {
       "startDate": "2026-04-15T00:00:00.000Z",
       "id": "m1",
       "name": "Tomate",
       "color": "#ff6347",
       "endDate": "2026-09-30T00:00:00.000Z",
       "description": "Tomate sous serre. Rendement : 8 kg/m²",
       "interventions": [
         {"id": "mi1", "day": "0", "name": "Plantation", "type": "intervention_top", "description": ""},
         {"id": "mi2", "day": "30", "name": "Taille et tuteurage", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 6
     }
   ]
 }'),

(5, 'Rotation Céréales-Protéagineux',
 'Rotation courte céréales-protéagineux avec légumineuses pour optimiser l\'autonomie azotée.',
 'Conventionnel',
 'Blé,Pois,Colza',
 '{
   "title": "Rotation Céréales-Protéagineux",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "region": "France"
   },
   "steps": [
     {
       "startDate": "2026-03-15T00:00:00.000Z",
       "id": "cp1",
       "name": "Pois protéagineux",
       "color": "#90ee90",
       "endDate": "2026-07-30T00:00:00.000Z",
       "description": "Pois protéagineux d\'hiver. Rendement : 42 qx/ha",
       "interventions": [
         {"id": "cpi1", "day": "-10", "name": "Labour", "type": "intervention_top", "description": ""},
         {"id": "cpi2", "day": "0", "name": "Semis", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 5
     },
     {
       "startDate": "2026-10-01T00:00:00.000Z",
       "id": "cp2",
       "name": "Blé tendre",
       "color": "#d2b48c",
       "endDate": "2027-07-20T00:00:00.000Z",
       "description": "Blé tendre après pois. Rendement : 72 qx/ha",
       "interventions": [],
       "secondary_crop": false,
       "duration": 9
     }
   ]
 }'),

(6, 'Vigne en Agroforesterie',
 'Vignoble conduit en AB avec agroforesterie (haies fruitières) et enherbement permanent.',
 'Bio',
 'Vigne',
 '{
   "title": "Vigne Bio en Agroforesterie",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "region": "France"
   },
   "steps": [
     {
       "startDate": "2026-01-01T00:00:00.000Z",
       "id": "v1",
       "name": "Vigne (année complète)",
       "color": "#800080",
       "endDate": "2026-12-31T00:00:00.000Z",
       "description": "Conduite de la vigne en AB avec enherbement",
       "interventions": [
         {"id": "vi1", "day": "60", "name": "Taille", "type": "intervention_top", "description": ""},
         {"id": "vi2", "day": "150", "name": "Traitement cuivre/soufre", "type": "intervention_top", "description": ""},
         {"id": "vi3", "day": "270", "name": "Vendanges", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 12
     }
   ]
 }'),

(7, 'Grandes Cultures Classiques',
 'Rotation blé-colza-orge avec labour et protection chimique raisonnée.',
 'Conventionnel',
 'Blé,Colza,Orge',
 '{
   "title": "Rotation Classique",
   "options": {
     "view": "horizontal",
     "show_transcript": false,
     "region": "France"
   },
   "steps": [
     {
       "startDate": "2026-08-20T00:00:00.000Z",
       "id": "gc1",
       "name": "Colza",
       "color": "#ffd700",
       "endDate": "2027-07-15T00:00:00.000Z",
       "description": "Colza avec protection intégrée. Rendement : 38 qx/ha",
       "interventions": [
         {"id": "gci1", "day": "0", "name": "Labour et semis", "type": "intervention_top", "description": ""},
         {"id": "gci2", "day": "60", "name": "Herbicide automne", "type": "intervention_top", "description": ""},
         {"id": "gci3", "day": "280", "name": "Récolte", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 11
     }
   ]
 }'),

(8, 'Arboriculture Bio',
 'Verger de pommiers et poiriers en AB avec enherbement et auxiliaires.',
 'Bio',
 'Pomme,Poire',
 '{
   "title": "Verger Bio",
   "options": {
     "view": "horizontal",
     "show_transcript": true,
     "region": "France"
   },
   "steps": [
     {
       "startDate": "2026-01-01T00:00:00.000Z",
       "id": "a1",
       "name": "Pommiers",
       "color": "#ff6b6b",
       "endDate": "2026-12-31T00:00:00.000Z",
       "description": "Conduite annuelle du verger en AB",
       "interventions": [
         {"id": "ai1", "day": "45", "name": "Taille hivernale", "type": "intervention_top", "description": ""},
         {"id": "ai2", "day": "120", "name": "Traitements bio", "type": "intervention_top", "description": ""},
         {"id": "ai3", "day": "250", "name": "Récolte", "type": "intervention_top", "description": ""}
       ],
       "secondary_crop": false,
       "duration": 12
     }
   ]
 }');
