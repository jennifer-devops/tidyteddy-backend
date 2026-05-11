const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const HttpStatus = require('../controller/controller.js');
const dotenv = require('dotenv');
const express = require('express');
dotenv.config();
const app = express();

const getAPIKey = (req, res) => {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Fetching API Key`);
  
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('API Key is not defined in environment variables');
      }
  
      res.status(HttpStatus.OK.code).send(
        new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'API Key found.', { apiKey })
      );
    } catch (error) {
      logger.error(`Error fetching API Key: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
        new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error.message)
      );
    }
  };

 const getW3formlAPIKey = (req, res) => {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Fetching API Key`);
  
      const apiKey = process.env.WEB3FORMS_KEY;
      if (!apiKey) {
        throw new Error('API Key is not defined in environment variables');
      }
  
      res.status(HttpStatus.OK.code).send(
        new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'API Key found.', { apiKey })
      );
    } catch (error) {
      logger.error(`Error fetching API Key: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
        new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error.message)
      );
    }
  };
  
const getStripePublicAPIKey = (req, res) => {
    try {
      logger.info(`${req.method} ${req.originalUrl} - Fetching API Key`);
  
      const apiKey = process.env.STRIPE_PUBLISHABLE_KEY;
      if (!apiKey) {
        throw new Error('API Key is not defined in environment variables');
      }
  
      res.status(HttpStatus.OK.code).send(
        new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'API Key found.', { apiKey })
      );
    } catch (error) {
      logger.error(`Error fetching API Key: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
        new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, error.message)
      );
    }
  };
module.exports = { getAPIKey, getW3formlAPIKey, getStripePublicAPIKey };