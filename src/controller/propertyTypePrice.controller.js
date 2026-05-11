const database = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const QUERY = require('../query/propertyTypePrice.query.js');
const HttpStatus = require('../controller/controller.js');

const getAllPropertyTypePrice = async (req, res)=>{
  try {
    logger.info(`${req.method} ${req.originalUrl} - Fetching property type prices`);

    const [result] = await database.query(QUERY.SELECT_ALL_PRICES);

    if (result.length === 0) {
      return res.status(HttpStatus.NO_CONTENT.code).send(
        new Response(HttpStatus.NO_CONTENT.code, HttpStatus.NO_CONTENT.status, "No prices found")
      );
    }
    res.status(HttpStatus.OK.code).send(
      new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Prices found", { data: result })
    );
  } catch (error) {
    logger.error(`Error fetching property type prices: ${error.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
      new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred")
    );
  }
}

const deletePropertyTypePriceById = async (req, res)=>{
  try {
    logger.info(`${req.method} ${req.originalUrl} - Deleting property type prices`);
    await database.query(QUERY.DELETE_TYPE_PRICE, [req.params.property_type_price_id]);
    res.status(HttpStatus.OK.code).send(
      new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Delete successfully")
    );
  } catch (error) {
    logger.error(`Error deleting property type price: ${error.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
      new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred")
    );
  }
}

const updatePropertyTypePriceById = async (req, res)=>{
  try {
    logger.info(`${req.method} ${req.originalUrl} - Updating property type price`);
    const {property_type_description, property_type_price} = req.body;
    await database.query(QUERY.UPDATE_TYPE_PRICE, [property_type_description, property_type_price, req.params.property_type_price_id]);
    res.status(HttpStatus.OK.code).send(
      new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Update successfully")
    );
  } catch (error) {
    logger.error(`Error updating property type price: ${error.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
      new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred")
    );
  }
}

const createPropertyTypePrice = async (req, res)=>{
  try {
    const {property_type_price_id, bedroom_count, bathroom_count, property_type, property_type_description, property_type_price, service_type} = req.body;
    logger.info(`${req.method} ${req.originalUrl} - Creating property type price`);
    await database.query(QUERY.CREATE_TYPE_PRICE, [property_type_price_id, bedroom_count, bathroom_count, property_type, property_type_description, property_type_price, service_type]);
    res.status(HttpStatus.OK.code).send(
      new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Create successfully")
    );
  } catch (error) {
    logger.error(`Error creating property type price: ${error.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
      new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred")
    );
  }
}

module.exports = { getAllPropertyTypePrice, deletePropertyTypePriceById, updatePropertyTypePriceById, createPropertyTypePrice };