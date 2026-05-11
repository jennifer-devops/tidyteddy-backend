CREATE TABLE propertyTypePrice (
    property_type_price_id      INT,
    bedroom_count               INT,
    bathroom_count              INT,
    property_type               ENUM('House/Townhouse', 'Apartment') NOT NULL,
    property_type_description   VARCHAR(100),
    service_type          ENUM('Daily Cleaning', 'Hourly Cleaning', 'Spring Cleaning', 'Bond Cleaning') NOT NULL,
    property_type_price         DECIMAL(10,2),  
    PRIMARY KEY (property_type_price_id)
);