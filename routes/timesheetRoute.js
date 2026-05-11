const express = require("express");
const {
  createTimesheet,
} = require("../src/controller/timesheet.controller.js");
const { authenticateToken } = require("../src/middleware/authMiddleware.js");
const timesheetRoutes = express.Router();
timesheetRoutes.use(authenticateToken);

timesheetRoutes.route("/staff/timesheet").post(createTimesheet);

module.exports = timesheetRoutes;
