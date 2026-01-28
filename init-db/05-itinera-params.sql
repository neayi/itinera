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
