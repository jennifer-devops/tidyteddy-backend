
CREATE TABLE bookingAddon (
    booking_addon_id   INT AUTO_INCREMENT,
    addon_quantity     INT NOT NULL,
    booking_id         INT NOT NULL,
    addon_id           INT NOT NULL,
    PRIMARY KEY (booking_addon_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (addon_id) REFERENCES addOn(addon_id)
);
