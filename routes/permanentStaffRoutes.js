const express = require("express");
const {
  getTimesheetList,
  getDaylySummary,
  getScheduleList,
  getWeeklySummary,
} = require("../src/controller/permanentStaff.controller.js");
const { authenticateToken } = require("../src/middleware/authMiddleware.js");
const permanentStaffRoutes = express.Router();
permanentStaffRoutes.use(authenticateToken);

permanentStaffRoutes.route("/permanent/timesheet-list").get(getTimesheetList);
permanentStaffRoutes.route("/permanent/schedule-list").get(getScheduleList);
permanentStaffRoutes.route("/permanent/weekly-summary").get(getWeeklySummary);
permanentStaffRoutes.route("/permanent/daily-summary").get(getDaylySummary);

module.exports = permanentStaffRoutes;
