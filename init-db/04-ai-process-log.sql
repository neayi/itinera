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
