const express = require("express");
const {
  getAllDiscount,
  getDiscountById,
  getDiscountWithValue,
} = require("../src/controller/discountChecking.controller.js");

const discountCheckingRoutes = express.Router();

discountCheckingRoutes.route("/discount").get(getAllDiscount);
discountCheckingRoutes.route("/discount/:discount_id").get(getDiscountById);
discountCheckingRoutes
  .route("/discount-code/:discount_code")
  .get(getDiscountWithValue);

module.exports = discountCheckingRoutes;
