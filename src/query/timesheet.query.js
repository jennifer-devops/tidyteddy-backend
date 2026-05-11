const TIMESHEET_QUERY = {
  SELECT_TIMESHEET_BY_DATE_WORKED: 'SELECT * FROM timesheet WHERE date_worked = ?',
  SELECT_FRONTEND_TIMESHEET_AND_SUBMITTER_BY_DATE_WORKED_AND_STAFF_USERNAME: `
  SELECT 
    t.*, 
    s.first_name, 
    s.last_name,
    (
        SELECT GROUP_CONCAT(CONCAT(s2.first_name, ' ', s2.last_name) SEPARATOR ', ') 
        FROM schedule sc 
        JOIN staff s2 ON sc.staff_id = s2.staff_id 
        WHERE sc.booking_id = t.booking_id
    ) AS coworker
FROM timesheet t
JOIN staff s ON t.staff_id = s.staff_id
WHERE t.date_worked = ?
  AND t.booking_id IN (
      SELECT DISTINCT sc.booking_id
      FROM schedule sc
      JOIN staff s ON sc.staff_id = s.staff_id
      WHERE s.username = ?
  );
`, 
SELECT_FRONTEND_TIMESHEET_AND_SUBMITTER_BY_TWO_DATE_WORKED_AND_STAFF_USERNAME: `SELECT 
    t.*, 
    s.first_name, 
    s.last_name,
    (
        SELECT GROUP_CONCAT(CONCAT(s2.first_name, ' ', s2.last_name) SEPARATOR ', ') 
        FROM schedule sc 
        JOIN staff s2 ON sc.staff_id = s2.staff_id 
        WHERE sc.booking_id = t.booking_id
    ) AS coworker
FROM timesheet t
JOIN staff s ON t.staff_id = s.staff_id
WHERE t.date_worked BETWEEN ? AND ?
  AND t.booking_id IN (
      SELECT DISTINCT sc.booking_id
      FROM schedule sc
      JOIN staff s ON sc.staff_id = s.staff_id
      WHERE s.username = ?
  );
`, 
CREATE_TIMESHEET: `INSERT INTO timesheet (staff_id, booking_id, date_worked, started_at, finished_at, submitted_at, approved_status)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
SELECT_TIMESHEET_BY_BOOKING_ID: 'SELECT * FROM timesheet WHERE booking_id = ?',
};
module.exports = TIMESHEET_QUERY;