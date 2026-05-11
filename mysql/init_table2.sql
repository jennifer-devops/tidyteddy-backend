CREATE TABLE IF NOT EXISTS addOn (
    addon_id         INT AUTO_INCREMENT,
    addon_name       VARCHAR(100) NOT NULL,
    bedroom_number   INT,
    max_quantity     INT,
    price            DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (addon_id)
);