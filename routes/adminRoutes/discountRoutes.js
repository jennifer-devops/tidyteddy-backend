//Users/fangshi/site-backend/routes/AdminRoutes/discountRoutes.js

const express = require("express");
const discountController = require("../../src/controller/discount.controller.js");
const discountRoutes = express.Router();

// Get all discounts
discountRoutes.get("/discount", discountController.getAllDiscounts);

// Search discounts by time period
discountRoutes.get("/discount/search", discountController.searchDiscounts);

// Create a new discount
discountRoutes.post("/discount", discountController.createDiscount);

// Update a discount
discountRoutes.put("/discount/:discount_id", discountController.updateDiscount);

// Delete a discount
discountRoutes.delete(
  "/discount/:discount_id",
  discountController.deleteDiscount
);

// Validate discount code endpoint
discountRoutes.get(
  "/discount/validate/:discount_code",
  discountController.validateDiscountCode
);

module.exports = discountRoutes;
