CREATE TABLE leaveRequest (
    leaveRequest_id     INT AUTO_INCREMENT,
    applicant_id        INT NOT NULL,
    leave_start_date    DATE NOT NULL,
    leave_end_date      DATE NOT NULL,
    notes               TEXT,
    approval_status     ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by         INT,
    PRIMARY KEY (leaveRequest_id),
    FOREIGN KEY (applicant_id) REFERENCES staff(staff_id),
    FOREIGN KEY (approved_by) REFERENCES staff(staff_id)
);