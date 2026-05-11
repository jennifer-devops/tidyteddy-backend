
CREATE TABLE customers (
    customer_id         INT AUTO_INCREMENT,
    first_name          VARCHAR(30) NOT NULL,
    last_name           VARCHAR(30),
    email               VARCHAR(80),
    phone               VARCHAR(15) NOT NULL,
    PRIMARY KEY (customer_id),
    CONSTRAINT UQ_Customers_Phone UNIQUE (phone)
);


