const express = require("express");
const {
  createPropertyTypePrice,
  deletePropertyTypePriceById,
  getAllPropertyTypePrice,
  updatePropertyTypePriceById,
} = require("../src/controller/propertyTypePrice.controller.js");

const propertyTypePriceRoutes = express.Router();

propertyTypePriceRoutes
  .route("/property-type-price")
  .get(getAllPropertyTypePrice);
propertyTypePriceRoutes
  .route("/property-type-price/create")
  .post(createPropertyTypePrice);
propertyTypePriceRoutes
  .route("/property-type-price/:property_type_price_id")
  .delete(deletePropertyTypePriceById)
  .post(updatePropertyTypePriceById);

module.exports = propertyTypePriceRoutes;
