const Response = require('../domain/response.js');
const HttpStatus = require('./controller.js');
const pool = require('../config/mysql.config.js');
const logger = require('../logging/logger.js');
const TIMESHEET_QUERY = require('../query/timesheet.query.js');
const STAFF_QUERY = require('../query/staff.query.js');
const SCHEDULE_QUERY = require('../query/schedule.query.js');

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}



//======================method begin===========================================


const getTimesheetList = async (req, res) => {
    const { date } = req.query;
    const staff_username = req.user.username;
    console.log("username-token:", staff_username)
    const today = new Date();
    let formattedDate = formatDate(today);
    if (date) {
        logger.info(`${req.method} ${req.originalUrl}, requesting timesheet list on : ${formattedDate}`);
        formattedDate = date;

    } else {
        logger.info(`${req.method} ${req.originalUrl}, requesting timesheet list on today`);

    }

    try {
        const [rows] = await pool.execute(TIMESHEET_QUERY.SELECT_FRONTEND_TIMESHEET_AND_SUBMITTER_BY_DATE_WORKED_AND_STAFF_USERNAME, [formattedDate, staff_username]);

        if (rows.length <= 0) {
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Timesheet record is empty.`));
        } else {
            const response = {
                data: rows,
            };
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Timesheet found.', response));

        }

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }
};



const getScheduleList = async (req, res) => {
    const { date } = req.query;
    const staff_username = req.user.username;
    console.log("username-token:", staff_username)
    const today = new Date();
    let formattedDate = formatDate(today);
    if (date) {
        logger.info(`${req.method} ${req.originalUrl}, requesting Schedule list on : ${date}`);
        formattedDate = date;

    } else {
        logger.info(`${req.method} ${req.originalUrl}, requesting Schedule list on today`);

    }

    try {
        const [rows] = await pool.execute(SCHEDULE_QUERY.SELECT_FRONTEND_SCHEDULE_BY_STAFF_USERNAME_AND_BOOKING_DATE, [staff_username, formattedDate]);

        if (rows.length <= 0) {
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Schedule record is empty.`));
        } else {
            const response = {
                data: rows,
            };
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Schedule found.', response));

        }

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }
};
const getWeeklySummary = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, requesting weekly summary`);
    const staff_username = req.user.username;
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));
    const start_date = formatDate(lastWeekStart);
    const end_date = formatDate(thisWeekEnd);
    let hourly_rate = 0
    try {
        const [rows] = await pool.execute(STAFF_QUERY.SELECT_STAFF_BY_USERNAME, [staff_username]);
        if (rows.length <= 0) {
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Staff info not found`));
        } else {
            hourly_rate = rows[0].hourly_rate;
            try {
                const [rows] = await pool.execute(TIMESHEET_QUERY.SELECT_FRONTEND_TIMESHEET_AND_SUBMITTER_BY_TWO_DATE_WORKED_AND_STAFF_USERNAME, [start_date, end_date, staff_username]);

                if (rows.length <= 0) {
                    const response = {
                        start_date: start_date,
                        end_date: end_date,
                        hourly_rate: hourly_rate,
                        hours: 0,
                        earned: 0,
                    };
                    res.status(HttpStatus.NOT_FOUND.code)
                        .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No data.`, response));
                } else {
                    const totalTimeWorked = rows
                        .map((timesheet) => {
                            const startTime = new Date(timesheet.started_at);
                            const finishTime = new Date(timesheet.finished_at);
                            const differenceInHours = (finishTime - startTime) / (1000 * 60 * 60); // 毫秒转小时
                            return differenceInHours;
                        })
                        .reduce((acc, curr) => acc + curr, 0);

                    const earned = hourly_rate * totalTimeWorked;
                    const response = {
                        start_date: start_date,
                        end_date: end_date,
                        hourly_rate: hourly_rate,
                        hours: totalTimeWorked,
                        earned: earned,
                    };
                    res.status(HttpStatus.OK.code)
                        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Summary found.', response));

                }

            } catch (err) {
                console.error('Error executing query:', err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
            }
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }


}

const getDaylySummary = async (req, res) => {
    const { date } = req.query;
    const staff_username = req.user.username;
    const today = new Date();
    let formattedDate = formatDate(today);
    if (date) {
        logger.info(`${req.method} ${req.originalUrl}, requesting daily summary on : ${date}`);
        formattedDate = date;

    } else {
        logger.info(`${req.method} ${req.originalUrl}, requesting daily summary on today`);

    }

    try {
        const [rows] = await pool.execute(TIMESHEET_QUERY.SELECT_FRONTEND_TIMESHEET_AND_SUBMITTER_BY_DATE_WORKED_AND_STAFF_USERNAME, [formattedDate, staff_username]);

        if (rows.length <= 0) {
            const response = {
                hoursDay: 0,
            };
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Timesheet record is empty.`, response));
        } else {
            const totalTimeWorked = rows
                .map((timesheet) => {
                    const startTime = new Date(timesheet.started_at);
                    const finishTime = new Date(timesheet.finished_at);
                    const differenceInHours = (finishTime - startTime) / (1000 * 60 * 60); // 毫秒转小时
                    return differenceInHours;
                })
                .reduce((acc, curr) => acc + curr, 0);

            const response = {
                hoursDay: totalTimeWorked,
            };
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Timesheet found.', response));

        }

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }
};
module.exports = { getDaylySummary, getScheduleList, getTimesheetList, getWeeklySummary };