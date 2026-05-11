CREATE TABLE payment (
    payment_id         INT AUTO_INCREMENT,
    payment_type       VARCHAR(50) NOT NULL,
    stripe_payment_id  VARCHAR(300),
    PRIMARY KEY (payment_id)
);