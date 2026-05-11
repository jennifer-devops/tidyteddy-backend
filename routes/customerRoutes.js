const express = require("express");
const {
  getCustomers,
  getCustomer,
  getCustomerByPhone,
  getCustomerByName,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../src/controller/customer.controller.js");
const { authenticateToken } = require("../src/middleware/authMiddleware.js");
const customerRoutes = express.Router();

customerRoutes.use(authenticateToken); //token保护

customerRoutes.route("/customer").get(getCustomers).post(createCustomer);
customerRoutes
  .route("/customer/:customer_id")
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);
customerRoutes.route("/customer/phone/:phone").get(getCustomerByPhone);
customerRoutes.route("/customer/name/:first_name").get(getCustomerByName);

module.exports = customerRoutes;
