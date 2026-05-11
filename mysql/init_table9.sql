CREATE TABLE schedule (
    schedule_id         INT AUTO_INCREMENT,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_id          INT,
    staff_id             INT,
    PRIMARY KEY (schedule_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);
