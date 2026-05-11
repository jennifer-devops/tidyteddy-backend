const database = require("../config/mysql.config.js");
const Response = require("../domain/response.js");
const logger = require("../logging/logger.js");
const QUERY = require("../query/addon.query.js");
const HttpStatus = require("../controller/controller.js");

const getAllAddons = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Fetching all addons`);
    const [result] = await database.query(QUERY.SELECT_ALL_ADDON);

    if (result.length === 0) {
      return res
        .status(HttpStatus.NO_CONTENT.code)
        .send(
          new Response(
            HttpStatus.NO_CONTENT.code,
            HttpStatus.NO_CONTENT.status,
            "No addon found"
          )
        );
    }
    res.status(HttpStatus.OK.code).send(
      new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Addon found", {
        data: result,
      })
    );
  } catch (error) {
    logger.error(`Error fetching addon: ${error.message}`);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(
        new Response(
          HttpStatus.INTERNAL_SERVER_ERROR.code,
          HttpStatus.INTERNAL_SERVER_ERROR.status,
          "An error occurred"
        )
      );
  }
};

const updateAddonPrice = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Updating addon price`);
    const { price } = req.body;
    const addonId = req.params.addon_id;
    if (!(await addonIdExists(addonId))) {
      return res
        .status(HttpStatus.NOT_FOUND.code)
        .send(
          new Response(
            HttpStatus.NOT_FOUND.code,
            HttpStatus.NOT_FOUND.status,
            "Addon not found"
          )
        );
    }
    await database.query(QUERY.UPDATE_ADDON_PRICE, [price, addonId]);
    res
      .status(HttpStatus.OK.code)
      .send(
        new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Addon updated")
      );
  } catch (error) {
    logger.error(`Error updating addon price: ${error.message}`);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(
        new Response(
          HttpStatus.INTERNAL_SERVER_ERROR.code,
          HttpStatus.INTERNAL_SERVER_ERROR.status,
          "An error occurred"
        )
      );
  }
};

const updateAddonQuantity = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Updating addon quantity`);
    const { quantity } = req.body;
    const addonId = req.params.addon_id;
    if (!(await addonIdExists(addonId))) {
      return res
        .status(HttpStatus.NOT_FOUND.code)
        .send(
          new Response(
            HttpStatus.NOT_FOUND.code,
            HttpStatus.NOT_FOUND.status,
            "Addon not found"
          )
        );
    }
    await database.query(QUERY.UPDATE_ADDON_QUANTITY, [quantity, addonId]);
    res
      .status(HttpStatus.OK.code)
      .send(
        new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Addon updated")
      );
  } catch (error) {
    logger.error(`Error updating addon quantity: ${error.message}`);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(
        new Response(
          HttpStatus.INTERNAL_SERVER_ERROR.code,
          HttpStatus.INTERNAL_SERVER_ERROR.status,
          "An error occurred"
        )
      );
  }
};

const addonIdExists = async (addonId) => {
  const [result] = await database.query(QUERY.SELECT_ADDON, addonId);
  return result[0].count !== 0;
};

module.exports = { getAllAddons, updateAddonPrice, updateAddonQuantity };
