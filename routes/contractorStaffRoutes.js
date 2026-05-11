const express = require("express");
const {authenticateToken} = require("../src/middleware/authMiddleware.js");
const { createNewContractor, 
    getContractors, 
    getContractorById, 
    getContractorByName, 
    getWorkInformationByStaffId,
    getCurrentDateWorkInfoById,
    getHistoryWorkInfoById,
    createNewTimesheet, getBookingIdByStaffIdFromTimesheet, getCoWorkerId,
    getTimesheet, getSpecificDateTimesheetByStaffId } = require("../src/controller/contractStaff.controller.js");
const contractorStaffRoutes = express.Router();
contractorStaffRoutes.use(authenticateToken);
contractorStaffRoutes.route('/contractor/').get(authenticateToken, getContractors);
contractorStaffRoutes.route('/contractor/').post(authenticateToken, createNewContractor);
contractorStaffRoutes.route('/contractor/:id').get(authenticateToken, getContractorById);
contractorStaffRoutes.route('/contractor/name/:name').get(authenticateToken,getContractorByName);
contractorStaffRoutes.route('/contractor/work/:id').get(authenticateToken, getWorkInformationByStaffId);
contractorStaffRoutes.route('/contractor/work/date/:id').get(authenticateToken, getCurrentDateWorkInfoById);
contractorStaffRoutes.route('/contractor/work/history/:id').get(authenticateToken, getHistoryWorkInfoById);
contractorStaffRoutes.route('/contractor/timesheet').post(authenticateToken, createNewTimesheet);
contractorStaffRoutes.route('/contractor/co-worker/:id').get(authenticateToken, getCoWorkerId);
contractorStaffRoutes.route('/contractor/booking-id/:id').get(authenticateToken, getBookingIdByStaffIdFromTimesheet);
contractorStaffRoutes.route('/contractor/timesheet/:id').get(authenticateToken, getTimesheet);
contractorStaffRoutes.route('/contractor/timesheet/spcific/:id').get(authenticateToken, getSpecificDateTimesheetByStaffId);
module.exports = contractorStaffRoutes;