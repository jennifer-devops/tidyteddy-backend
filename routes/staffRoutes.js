const express = require("express");
const staffController = require("../src/controller/staffController");
const staffRouter = express.Router();
//get staff list
staffRouter.get("/available", staffController.getAvailableStaff);

module.exports = staffRouter;
