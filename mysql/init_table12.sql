CREATE TABLE bookingHistory (
    bookingHistory_id   INT AUTO_INCREMENT,
    booking_id          INT NOT NULL,
    updated_by          INT NOT NULL,
    activity            JSON,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (bookingHistory_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (updated_by) REFERENCES staff(staff_id)
);