const database = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const PAYMENTQUERY = require('../query/payment.query.js');
const HttpStatus = require('../controller/controller.js');



const getBookingByPaymentId = async (req, res) => {

    logger.info(`${req.method} ${req.originalUrl}, fetching booking by payment id ${req.params.payment_id}`);
    // check whether the payment exists
    const [result] = await database.query(PAYMENTQUERY.SELECT_BOOKING_BY_PAYMENT_ID, [req.params.payment_id]);
    if (result.length === 0) {
        return res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Booking not found by Payment Id ${req.params.payment_id}.`));
    }
    res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Booking found.', result[0]));

};
module.exports = { getBookingByPaymentId };
