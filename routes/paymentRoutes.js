//get booking, customer, property, discount information by payment id
const express = require("express");
const {
  getBookingByPaymentId,
} = require("../src/controller/payment.controller.js");

const paymentRoutes = express.Router();

paymentRoutes.route("/booking/:payment_id").get(getBookingByPaymentId);

module.exports = paymentRoutes;
