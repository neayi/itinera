-- Create database with utf8mb4_general_ci collation
CREATE DATABASE IF NOT EXISTS itinera_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE itinera_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS systems;
DROP TABLE IF EXISTS farms;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'ID from Discourse SSO',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_external_id (external_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Farms table (replaces exploitations)
CREATE TABLE farms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    farmer_name VARCHAR(255) NOT NULL,
    gps_location VARCHAR(255),
    town VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Systems table (combines itineraries, parcelles, and rotation data)
CREATE TABLE systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system_type VARCHAR(100),
    productions TEXT,
    gps_location VARCHAR(255),
    json JSON,
    eiq DECIMAL(10,2) DEFAULT NULL COMMENT 'Environmental Impact Quotient',
    gross_margin DECIMAL(10,2) DEFAULT NULL COMMENT 'Gross margin in euros',
    duration INT DEFAULT NULL COMMENT 'Duration of the system in years',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farm_id (farm_id),
    INDEX idx_user_id (user_id),
    INDEX idx_eiq (eiq),
    INDEX idx_gross_margin (gross_margin),
    INDEX idx_duration (duration),
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create ai_process_log table to track AI calculations
CREATE TABLE IF NOT EXISTS ai_process_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  system_id INT NOT NULL,
  intervention VARCHAR(255) NOT NULL,
  indicator VARCHAR(100) NOT NULL,
  user_id INT NULL,
  start DATETIME NOT NULL,
  end DATETIME NULL,
  status ENUM('started', 'completed', 'failed', 'aborted') NOT NULL DEFAULT 'started',
  total_indicators INT NULL,
  processed_indicators INT DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_system_id (system_id),
  INDEX idx_status (status),
  INDEX idx_start (start),

  FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create itinera_params table for application configuration
CREATE TABLE IF NOT EXISTS itinera_params (
    `key` VARCHAR(255) PRIMARY KEY,
    value_int INT DEFAULT NULL,
    value_datetime DATETIME DEFAULT NULL,
    value_string TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create wiki_pages table for wiki reference data
CREATE TABLE IF NOT EXISTS wiki_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(255) NOT NULL,
    page_id INT NOT NULL,
    wiki_locale VARCHAR(2) NOT NULL DEFAULT 'fr',
    specification TINYINT(1) NOT NULL DEFAULT 0,
    soil TINYINT(1) NOT NULL DEFAULT 0,
    transaction VARCHAR(64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_page (page_id, wiki_locale),
    INDEX idx_wiki_locale (wiki_locale),
    INDEX idx_specification (specification),
    INDEX idx_soil (soil),
    INDEX idx_transaction (transaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
