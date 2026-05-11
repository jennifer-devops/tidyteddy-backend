CREATE TABLE staff (
    staff_id            INT AUTO_INCREMENT,
    first_name          VARCHAR(50),
    last_name           VARCHAR(50),
    username            VARCHAR(50) UNIQUE,
    password_hash       VARCHAR(255),
    email               VARCHAR(200),
    phone_number        VARCHAR(15),
    hourly_rate         DECIMAL(10, 2),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    staff_role          VARCHAR(50),
    employment_type     ENUM('contractor', 'permanent'),
    is_active           BOOLEAN,
    revenue_sharing_percentage  DECIMAL(10,2),
    staff_availability  VARCHAR(300),
    PRIMARY KEY (staff_id)
);
