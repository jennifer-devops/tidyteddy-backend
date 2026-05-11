const SCHEDULE_QUERY = {
    SELECT_STAFF_ID_BY_BOOKING_ID: 'SELECT staff_id FROM schedule WHERE booking_id = ?',
    SELECT_STAFF_NAMES_BY_BOOKING_ID: 'SELECT CONCAT(s.first_name, " ", s.last_name) AS staff_name FROM schedule sc JOIN staff s ON sc.staff_id = s.staff_id WHERE sc.booking_id = ?',
    COUNT_BY_STAFF_ID_AND_BOOKING_ID: 'SELECT COUNT(*) AS count FROM schedule WHERE staff_id = ? AND booking_id = ?',
    SELECT_FRONTEND_SCHEDULE_BY_STAFF_USERNAME_AND_BOOKING_DATE: `SELECT 
    b.booking_id,
    b.booking_date,
    b.time_slot,
    b.cleaning_plan,
    b.service_type,
    b.special_instructions,
    s.first_name,
    s.last_name,
    s.phone_number,
    p.*,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'addon_id', a.addon_id,
                'addon_name', a.addon_name,
                'addon_quantity', ba.addon_quantity
            )
        )
        FROM bookingAddon ba
        JOIN addOn a ON ba.addon_id = a.addon_id
        WHERE ba.booking_id = b.booking_id
    ) AS addon
FROM 
    staff s 
JOIN 
    schedule sc ON s.staff_id = sc.staff_id
JOIN 
    booking b ON sc.booking_id = b.booking_id
JOIN 
    propertys p ON b.property_id = p.property_id
WHERE 
    s.username = ?
    AND b.booking_date = ?;`,
}
module.exports = SCHEDULE_QUERY;