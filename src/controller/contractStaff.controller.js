const database = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const STAFF_QUERY = require('../query/staff.query.js');
const TIMESHEET_QUERY = require('../query/timesheet.query.js')
const HttpStatus = require('../controller/controller.js');

const createNewContractor = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, creating new contractor staff`);
    
       try{
        const [results, fields] = await database.query(STAFF_QUERY.CREATE_CONTRACTOR, Object.values(req.body));
        res.status(HttpStatus.CREATED.code)
        .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Contractor staff created.', results));
       } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
       }
    
};

const getContractors = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff`);
    try{
        const [row, feilds] = await database.query(STAFF_QUERY.SELECT_CONTRACTORS);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff found.', row));
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const getContractorById = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff by id ${req.params.id}`);
    try{
        const [row, feilds] = await database.query(STAFF_QUERY.SELECT_CONTRACT_STAFF_BY_ID, [req.params.id]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff found.', row));
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const getContractorByName = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff by id ${req.params.name}`);
    try{
        const [row, feilds] = await database.query(STAFF_QUERY.SELECT_CONTRACT_STAFF_BY_FIRST_NAME, [req.params.name]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff found.', row));
    }
    catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};
const getWorkInformationByStaffId = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff all work infromation by id ${req.params.id}`);
    try{
        const [row, feilds] = await database.query(STAFF_QUERY.SELECT_BOOKING_DETAILS_BY_STAFF_ID, [req.params.id]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff all work data found.', row));
    }
    catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const getCurrentDateWorkInfoById = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff current work information by id ${req.params.id}`);
    console.log(req.params);
    try{
        const [row, fields] = await database.query(STAFF_QUERY.SELECT_CURRENT_DATE_BOOKING_BY_CONTRACTOR_ID, [req.params.id]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff current work data found.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const getHistoryWorkInfoById = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractors staff history work information by id ${req.params.id}`);
    console.log(req.params);
    try{
        const [row, fields] = await database.query(STAFF_QUERY.SELECT_HISTORY_BOOKING_BY_CONTRACTOR_ID, [req.params.id]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors staff history work data found.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const createNewTimesheet = async(req, res) =>{
    const {staff_id, booking_id, date_worked, started_at, finished_at} = req.body;
    logger.info(`${req.method} ${req.originalUrl}, create constractor timesheet by staff id ${req.body.staff_id}`);
    try{
        const[row, fields] = await database.query(STAFF_QUERY.CREATE_TIMESHEET_BY_BOOKING_ID, Object.values(req.body));
        console.log(row);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors timesheet created.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
};

const getCoWorkerId = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, get co-workers staff id from schedule by booking id ${req.params.id}`);
    try{
        const[row, fields] = await database.query(STAFF_QUERY.SELECT_SCHEDULE_STAFF_ID_BY_BOOKING_ID, [req.params.id]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Found all co-workers staff id.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
}
const getTimesheet = async(req, res) =>{
    logger.info(`${req.method} ${req.originalUrl}, fetching constractor timesheet by staff id ${req.params.id}`);
    try{
        const[row, fields] = await database.query(STAFF_QUERY.SELECT_TIMESHEET_BY_STAFF_ID, [req.params.id]);
        console.log(row);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors timesheet found.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
}

const getBookingIdByStaffIdFromTimesheet = async(req, res) =>{
    logger.info(`${req.method} ${req.originalUrl}, fetching constractor timesheet by staff id ${req.params.id}`);
    try{
        const[row, fields] = await database.query(STAFF_QUERY.SELECT_BOOKING_ID_FROM_TIMESHEET_BY_STAFF_ID, [req.params.id]);
        console.log(row);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Contractors timesheet found.', row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    }
}
const getSpecificDateTimesheetByStaffId = async(req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching contractor-specific timesheet data for specific dates by staff ID ${req.params.id}`);
    console.log(req.query);
    try{
        const[row, fields] = await database.query(STAFF_QUERY.SELECT_SPECIFIC_DATE_TIMESHEET_BY_CONTRACTOR_STAFF_ID, 
            [req.params.id, req.query.startDate, req.query.endDate]);
        res.status(HttpStatus.OK.code)
        .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, `Contractor's timesheet for specific dates found.`, row));
    }catch(error){
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
        .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Error.'));
    } 
}

module.exports = { createNewContractor, getContractors, getContractorById, 
    getContractorByName, getWorkInformationByStaffId, getCurrentDateWorkInfoById, getHistoryWorkInfoById,
    createNewTimesheet, getCoWorkerId, getTimesheet, getBookingIdByStaffIdFromTimesheet, getSpecificDateTimesheetByStaffId };