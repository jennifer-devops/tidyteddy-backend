const express = require("express");
const {
  getAPIKey,
  getStripePublicAPIKey,
  getW3formlAPIKey,
} = require("../src/controller/APIKey.controller.js");
const apiRoutes = express.Router();

apiRoutes.route("/api/keys").get(getAPIKey);
apiRoutes.route("/api/stripe-public-key").get(getStripePublicAPIKey);
apiRoutes.route("/api/w3forml-key").get(getW3formlAPIKey);

module.exports = apiRoutes;
