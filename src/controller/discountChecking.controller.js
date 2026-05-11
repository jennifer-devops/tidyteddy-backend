const database = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const DISCOUNTCHECKINGQUERY = require('../query/discountChecking.query.js');
const HttpStatus = require('../controller/controller.js');



//get all the discounts
const getAllDiscount = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching discounts`);
    const [rows] = await database.query(DISCOUNTCHECKINGQUERY.FOUND_DISCOUNT);
    console.log(rows);
    try {
        if (!rows[0]){
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'No discounts found.'));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Discounts found.', {discounts: rows}));
        }
    } catch (error) {
        logger.error(error.message);
    }
};


//get sigle discount by id
const getDiscountById = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching discount by id ${req.params.discount_id}`);
    const [rows] = await database.query(DISCOUNTCHECKINGQUERY.SELECT_DISCOUNT_BY_ID, [req.params.discount_id]);
    try{
        console.log(rows);
        if (!rows[0]){
            res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Discount not found by id ${req.params.discount_id}.`));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Discount found.', rows[0]));
        }
    
    }catch (error) {
        logger.error(error.message);
    }
        
};

//find discount value by discount code
const getDiscountWithValue = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching discount by discount code ${req.params.discount_code}`);
    const [rows] = await database.query(DISCOUNTCHECKINGQUERY.FOUND_VALUE_BY_CODE, [req.params.discount_code]);
    try{
        console.log(rows);
        if (!rows[0]){
            res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Discount not found by discount code ${req.params.discount_code}.`));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Discount found.', rows[0]));
            let date = new Date();
            logger.info(`today's date is ${date}`);
            if(rows[0].expiration_date < date){
                logger.info(`discount code ${req.params.discount_code} is expired`);
            }else{
                logger.info(`discount code ${req.params.discount_code} is not expired`);
                logger.info(`discount value is ${rows[0].discount_value}, type is ${rows[0].discount_type}`);
            }
        }
    
    }catch (error) {
        logger.error(error.message);
    }
};
module.exports = { getAllDiscount, getDiscountById, getDiscountWithValue };