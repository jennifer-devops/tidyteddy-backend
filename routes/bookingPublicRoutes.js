const express = require("express");
const {
  validateContact,
  createBooking,
} = require("../src/controller/booking.controller.js");
const {
  getAllPropertyTypePrice,
} = require("../src/controller/propertyTypePrice.controller.js");
const { getAllAddons } = require("../src/controller/addon.controller.js");

const bookingPublicRouter = express.Router();

bookingPublicRouter
  .route("/public/booking/validate-customer")
  .post(validateContact);
bookingPublicRouter.route("/public/booking/create").post(createBooking);
bookingPublicRouter
  .route("/public/booking/property-type-price")
  .get(getAllPropertyTypePrice);
bookingPublicRouter.route("/public/booking/addons").get(getAllAddons);

module.exports = bookingPublicRouter;
