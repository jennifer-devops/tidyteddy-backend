CREATE TABLE propertys (
    property_id         INT AUTO_INCREMENT,
    property_type       ENUM('House/Townhouse', 'Apartment') NOT NULL,
    bedrooms_count      INT ,
    bathrooms_count     INT ,
    property_address    VARCHAR(255) NOT NULL,
    postcode            VARCHAR(4) NOT NULL,
    parking_option      VARCHAR(150) NOT NULL,
    entry_access        ENUM('I will be home', 'I will not be home') NOT NULL,
    entry_instruction   TEXT,
    PRIMARY KEY (property_id)
);






