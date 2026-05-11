const express = require("express");
const {
  getAllAddons,
  updateAddonPrice,
  updateAddonQuantity,
} = require("../src/controller/addon.controller.js");
const addonRoutes = express.Router();
addonRoutes.route("/addon").get(getAllAddons);
addonRoutes.route("/addon/:addon_id").post(updateAddonPrice);
addonRoutes.route("/addon/quantity/:addon_id").post(updateAddonQuantity);
module.exports = addonRoutes;
