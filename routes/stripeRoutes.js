const express = require("express");
const {
  createPaymentIntent,
} = require("../src/controller/stripe.controller.js");
const stripeRoutes = express.Router();
stripeRoutes.route("/create-payment-intent").post(createPaymentIntent);
module.exports = stripeRoutes;
