CREATE TABLE discount (
  discount_id      INT AUTO_INCREMENT PRIMARY KEY,
  discount_code    VARCHAR(15) NOT NULL UNIQUE,
  discount_type    ENUM('fixed', 'percentage') DEFAULT 'fixed',
  discount_value   DECIMAL(10,2),
  create_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
  active_from      DATETIME NOT NULL,
  expiration_date      DATETIME NOT NULL
);
