const express = require("express");
const {
  createBooking,
  deleteBooking,
  editBookingPrice,
  getBookingRecords,
  validateContact,
  restoreBooking,
} = require("../src/controller/booking.controller.js");

const router = express.Router();

// router.get('/booking/validate-customer', validateContact)
router.route("/booking/validate-customer").post(validateContact);
router.post("/booking/create", createBooking);
router.post("/booking/get", getBookingRecords);
router.post("/booking/edit", editBookingPrice);
router.post("/booking/delete", deleteBooking);
router.post("/booking/restore", restoreBooking);

module.exports = router;
