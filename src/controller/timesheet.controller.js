const Response = require('../domain/response.js');
const HttpStatus = require('./controller.js');
const pool = require('../config/mysql.config.js');
const logger = require('../logging/logger.js');
const TIMESHEET_QUERY = require('../query/timesheet.query.js');
const STAFF_QUERY = require('../query/staff.query.js');
const SCHEDULE_QUERY = require('../query/schedule.query.js');

const validateForeignKey = async (table, column, id) => {
    const [rows] = await pool.execute(`SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`, [id]);
    return rows.length > 0;
};
const convertToDate = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
};

//======================method begin===========================================


const createTimesheet = async (req, res) => {

    try {
        const staff_username = req.user.username;
        let staff_id = 0;
        const {
            booking_id,
            date_worked,
            started_at,
            finished_at,
        } = req.body;
        logger.info(`${req.method} ${req.originalUrl}, creating timesheet on : ${booking_id}`);
        const isStaffValid = await validateForeignKey('staff', 'username', staff_username);
        if (!isStaffValid) {
            return res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Staff not found'));
        } else {
            const [rows] = await pool.execute(STAFF_QUERY.SELECT_STAFF_BY_USERNAME, [staff_username]);
            staff_id = rows[0].staff_id;
        }

        const isBookingValid = await validateForeignKey('booking', 'booking_id', booking_id);
        if (!isBookingValid) {
            return res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Booking not found'));
        } else {
            const [rows] = await pool.execute(TIMESHEET_QUERY.SELECT_TIMESHEET_BY_BOOKING_ID, [booking_id]);
            if (rows.length > 0) {
                return res.status(HttpStatus.BAD_REQUEST.code)
                    .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Timesheet has been submitted by others.'));
            }
        }

        const [rows] = await pool.query(SCHEDULE_QUERY.COUNT_BY_STAFF_ID_AND_BOOKING_ID, [staff_id, booking_id]);
        if (rows[0].count <= 0) {
            return res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'The staff is not assigned to this booking.'));
        }

        const startedAtDate = convertToDate(started_at);
        const finishedAtDate = convertToDate(finished_at);

        if (startedAtDate >= finishedAtDate) {
            return res.status(HttpStatus.BAD_REQUEST.code)
                .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Started time must be earlier than finished time'));
        }

        const [result] = await pool.execute(TIMESHEET_QUERY.CREAT_TIMESHEET, [
            staff_id,
            booking_id,
            date_worked,
            `${date_worked} ${started_at}`,
            `${date_worked} ${finished_at}`,
            'pending',
        ]);

        res.status(HttpStatus.CREATED.code)
            .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Timesheet created successfully', { result }));
    } catch (error) {
        console.error('Error creating timesheet:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Failed to create timesheet'));
    }
}

module.exports = { createTimesheet };