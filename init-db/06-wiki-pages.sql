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
