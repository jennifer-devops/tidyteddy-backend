const STAFF_QUERY = {
    SELECT_STAFF_BY_USERNAME: 'SELECT * FROM staff WHERE username = ?',
    SELECT_STAFF_BY_STAFF_ID: 'SELECT * FROM staff WHERE staff_id = ?',
    SELECT_STAFF_BY_EMAIL: 'SELECT * FROM staff WHERE email = ?',
    UPDATE_STAFF_PASSWORD_BY_EMAIL: 'UPDATE staff SET password_hash = ? WHERE email = ?',
    //get all contractor staff details
    SELECT_CONTRACTORS: 
    `SELECT * FROM staff WHERE employment_type = "contractor"`,
    //Create a new contractor staff
    CREATE_CONTRACT_STAFF:
    `INSERT INTO staff(first_name, last_name, username, password_hash, email, phone_number, hourly_rate, 
    staff_role, is_active, employment_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    // get contractor staff details by staff id
    SELECT_CONTRACT_STAFF_BY_ID: 
    `SELECT * FROM staff WHERE staff_id = ? AND employment_type = "contractor"`,
    //get contractor staff details by staff first name
    SELECT_CONTRACT_STAFF_BY_FIRST_NAME:
    `SELECT * FROM staff WHERE first_name = ? AND employment_type = "contractor"`,
    // get contractor staff job details by staff id
    SELECT_BOOKING_DETAILS_BY_STAFF_ID: 
    `SELECT b.booking_id, b.booking_date, b.time_slot, b.cleaning_plan,
    b.service_type, b.special_instructions, b.hours_count, b.final_price, 
    COALESCE(GROUP_CONCAT(ba.addon_quantity SEPARATOR ','), "" )AS addon_quantity,
    p.property_type, p.bedrooms_count, p.bathrooms_count, p.property_address, p.postcode, p.parking_option, 
    p.entry_access, p.entry_instruction,
    c.first_name, c.last_name, c.email, c.phone,
    COALESCE(GROUP_CONCAT(a.addon_name SEPARATOR ','), "" )AS addon_name,
    COALESCE(SUM(a.price * ba.addon_quantity), 0) AS total_addon_price
    FROM booking b
    JOIN propertys p ON b.property_id = p.property_id
    JOIN customers c ON b.customer_id = c.customer_id
    LEFT JOIN bookingAddon ba on b.booking_id = ba.booking_id
    LEFT JOIN addOn a on ba.addon_id = a.addon_id
    JOIN schedule sc ON sc.booking_id = b.booking_id
    JOIN staff s ON sc.staff_id = s.staff_id
    WHERE s.staff_id = ? AND s.employment_type = "contractor"
    GROUP BY b.booking_id
    ORDER BY b.booking_date DESC`,
    // get contractor staff job details by staff first name
    SELECT_BOOKING_DETAILS_BY_STAFF_FIRST_NAME:
    `SELECT b.booking_id, b.booking_date, b.time_slot, b.cleaning_plan,
    b.service_type, b.special_instructions, b.hours_count, b.final_price, 
    COALESCE(GROUP_CONCAT(ba.addon_quantity SEPARATOR ','), "" )AS addon_quantity,
    p.property_type, p.bedrooms_count, p.bathrooms_count, p.property_address, p.postcode, p.parking_option, 
    p.entry_access, p.entry_instruction,
    c.first_name, c.last_name, c.email, c.phone,
    COALESCE(GROUP_CONCAT(a.addon_name SEPARATOR ','), "" )AS addon_name,
    COALESCE(SUM(a.price * ba.addon_quantity), 0) AS total_addon_price
    FROM booking b
    JOIN propertys p ON b.property_id = p.property_id
    JOIN customers c ON b.customer_id = c.customer_id
    LEFT JOIN bookingAddon ba on b.booking_id = ba.booking_id
    LEFT JOIN addOn a on ba.addon_id = a.addon_id
    JOIN schedule sc ON sc.booking_id = b.booking_id
    JOIN staff s ON sc.staff_id = s.staff_id
    WHERE s.first_name = ? AND s.employment_type = "contractor"
    GROUP BY b.booking_id
    ORDER BY b.booking_date DESC`,
    //get current date booking information by contractor ID
    SELECT_CURRENT_DATE_BOOKING_BY_CONTRACTOR_ID:
    `SELECT b.booking_id, b.booking_date, b.time_slot, b.cleaning_plan,
    b.service_type, b.special_instructions, b.hours_count, b.final_price, 
    COALESCE(GROUP_CONCAT(ba.addon_quantity SEPARATOR ','), "" )AS addon_quantity,
    p.property_type, p.bedrooms_count, p.bathrooms_count, p.property_address, p.postcode, p.parking_option, 
    p.entry_access, p.entry_instruction,
    c.first_name, c.last_name, c.email, c.phone,
    COALESCE(GROUP_CONCAT(a.addon_name SEPARATOR ','), "" )AS addon_name,
    COALESCE(SUM(a.price * ba.addon_quantity), 0) AS total_addon_price
    FROM booking b
    JOIN propertys p ON b.property_id = p.property_id
    JOIN customers c ON b.customer_id = c.customer_id
    LEFT JOIN bookingAddon ba on b.booking_id = ba.booking_id
    LEFT JOIN addOn a on ba.addon_id = a.addon_id
    JOIN schedule sc ON sc.booking_id = b.booking_id
    JOIN staff s ON sc.staff_id = s.staff_id
    WHERE s.staff_id = ? AND s.employment_type = "contractor" AND b.booking_date = CURDATE()
    GROUP BY b.booking_id
    ORDER BY b.time_slot DESC`,
    //get history work data by contractor ID
    SELECT_HISTORY_BOOKING_BY_CONTRACTOR_ID:
    `SELECT b.booking_id, b.booking_date, b.time_slot, b.cleaning_plan,
    b.service_type, b.special_instructions, b.hours_count, b.final_price, 
    COALESCE(GROUP_CONCAT(ba.addon_quantity SEPARATOR ','), "" )AS addon_quantity,
    p.property_type, p.bedrooms_count, p.bathrooms_count, p.property_address, p.postcode, p.parking_option, 
    p.entry_access, p.entry_instruction,
    c.first_name, c.last_name, c.email, c.phone,
    COALESCE(GROUP_CONCAT(a.addon_name SEPARATOR ','), "" )AS addon_name,
    COALESCE(SUM(a.price * ba.addon_quantity), 0) AS total_addon_price
    FROM booking b
    JOIN propertys p ON b.property_id = p.property_id
    JOIN customers c ON b.customer_id = c.customer_id
    LEFT JOIN bookingAddon ba on b.booking_id = ba.booking_id
    LEFT JOIN addOn a on ba.addon_id = a.addon_id
    JOIN schedule sc ON sc.booking_id = b.booking_id
    JOIN staff s ON sc.staff_id = s.staff_id
    WHERE s.staff_id = ? AND s.employment_type = "contractor" AND b.booking_date < CURDATE()
    GROUP BY b.booking_id
    ORDER BY b.booking_date DESC`,
    // create timesheet details by booking id
    CREATE_TIMESHEET_BY_BOOKING_ID:
    `INSERT INTO timesheet (staff_id, booking_id, date_worked, started_at, finished_at, approved_status) 
    VALUES (?, ?, ?, ?, ?, "Pending")`,
    // get timesheet details by staff id
    SELECT_TIMESHEET_BY_STAFF_ID:
    `SELECT t.timesheet_id, t.booking_id, t.date_worked, t.started_at, t.finished_at, 
    t.submitted_at, t.approved_status, t.approved_by, 
    c.first_name, c.last_name
    FROM timesheet t
    JOIN staff st ON st.staff_id = t.staff_id
    JOIN booking b ON t.booking_id = b.booking_id
    JOIN customers c ON b.customer_id = c.customer_id
    WHERE st.staff_id = ? AND st.employment_type = "contractor";`,
    //Retrieve timesheet booking ID by staff ID to check for duplicate entries
    SELECT_BOOKING_ID_FROM_TIMESHEET_BY_STAFF_ID:
    `SELECT COALESCE(GROUP_CONCAT(booking_id SEPARATOR ','), "" )AS booking_id
    FROM timesheet
    WHERE staff_id = ?;`,
    // get timesheet details by staff first name
    SELECT_TIMESHEET_BY_STAFF_FIRST_NAME:
    `SELECT t.booking_id, t.date_worked, t.started_at, t.finished_at, t.submitted_at, 
    t.approved_status, t.approved_by, st.first_name, st.last_name,
    FROM timesheet t
    JOIN schedule s ON t.staff_id = s.staff_id
    JOIN staff st ON s.staff_id = st.staff_id
    WHERE st.first_name = ? AND st.employment_type = "contractor"`,
    // get two weeks timesheet details by staff id
    SELECT_SPECIFIC_DATE_TIMESHEET_BY_CONTRACTOR_STAFF_ID:
    `SELECT t.timesheet_id, t.booking_id, t.date_worked, t.started_at, t.finished_at, 
    t.submitted_at, t.approved_status, t.approved_by, 
    c.first_name, c.last_name,
    b.final_price, st.revenue_sharing_percentage
    FROM timesheet t
    JOIN staff st ON st.staff_id = t.staff_id
    JOIN booking b ON t.booking_id = b.booking_id
    JOIN customers c ON b.customer_id = c.customer_id
    WHERE st.staff_id = ? 
    AND st.employment_type = "contractor" 
    AND t.approved_status = "approved"
    AND t.date_worked BETWEEN ? AND ?`,
    //get all the schedule staff id by booking id
    SELECT_SCHEDULE_STAFF_ID_BY_BOOKING_ID:
    `SELECT COALESCE(GROUP_CONCAT(staff_id SEPARATOR ','), "" )AS staff_id
    FROM schedule
    WHERE booking_id = ?`,
    // get two weeks timesheet details by staff first name
    SELECT_TWO_WEEKS_TIMESHEET_BY_STAFF_FIRST_NAME:
    `SELECT t.booking_id, t.date_worked, t.approved_status,  
    st.first_name, st.last_name,
    b.final_price
    FROM timesheet t
    JOIN schedule s ON t.staff_id = s.staff_id
    JOIN booking b ON t.booking_id = b.booking_id
    JOIN staff st ON s.staff_id = st.staff_id
    WHERE st.first_name = ? 
    AND st.employment_type = "contractor" 
    AND t.date_worked BETWEEN DATE_SUB(CURDATE(2024-12-30), INTERVAL 14 DAY) AND CURDATE(2024-12-30)`,
};
module.exports = STAFF_QUERY;