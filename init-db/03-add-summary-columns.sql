-- Ajouter les colonnes pour les valeurs récapitulatives des systèmes
USE itinera_db;

ALTER TABLE systems
ADD COLUMN eiq DECIMAL(10,2) DEFAULT NULL COMMENT 'Environmental Impact Quotient calculé',
ADD COLUMN gross_margin DECIMAL(10,2) DEFAULT NULL COMMENT 'Marge brute en euros',
ADD COLUMN duration INT DEFAULT NULL COMMENT 'Durée du système en années';

-- Ajouter des index pour améliorer les performances de tri
CREATE INDEX idx_eiq ON systems(eiq);
CREATE INDEX idx_gross_margin ON systems(gross_margin);
CREATE INDEX idx_duration ON systems(duration);
