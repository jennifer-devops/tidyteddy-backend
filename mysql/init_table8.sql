CREATE TABLE timesheet (
    timesheet_id        INT AUTO_INCREMENT,
    date_worked         DATE NOT NULL,
    started_at          DATETIME,
    finished_at         DATETIME,
    submitted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_status     ENUM('pending','approved','rejected'),
    approved_by         INT,
    staff_id            INT,
    booking_id          INT,
    PRIMARY KEY (timesheet_id),
    FOREIGN KEY (approved_by) REFERENCES staff(staff_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);
