const { QUERY } = require('../query/booking.query.js');
const { getSearchQuery } = require('../query/booking.query.js');
const database = require('../config/mysql.config.js');
const logger = require('../logging/logger.js');
const Response = require('../domain/response.js');
const HttpStatus = require('./controller.js');

const createBooking = async (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating booking`);
  const bookingData = req.body;
  console.log(bookingData);
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    let customerId;
    const [customerRetrieve] = await connection.query(QUERY.GET_CUSTOMER_BY_PHONE, [bookingData.customer.phone_number]);
    if (customerRetrieve.length > 0) {
      customerId = customerRetrieve[0].customer_id;
    }
    else {
      const [customerResult] = await connection.query(QUERY.CREATE_CUSTOMER, [
        bookingData.customer.first_name,
        bookingData.customer.last_name,
        bookingData.customer.email,
        bookingData.customer.phone_number
      ]);
      customerId = customerResult.insertId;
    }

    const [propertyResult] = await connection.query(QUERY.CREATE_PROPERTY,
      [
        bookingData.property.property_type,
        bookingData.property.bedrooms_count || 0,
        bookingData.property.bathrooms_count || 0,
        bookingData.property.property_address,
        bookingData.property.postcode || "0000",
        bookingData.property.parking_option,
        bookingData.property.entry_access,
        bookingData.property.entry_instruction || "not instructions",
      ]);
    const propertyId = propertyResult.insertId;

    const [paymentResult] = await connection.query(QUERY.CREATE_PAYMENT,
      [
        bookingData.payment.payment_type,
        bookingData.payment.stripe_payment_id,
      ]);
    const paymentId = paymentResult.insertId;

    let discountId;
    if (bookingData.payment.discount_code) {
      const [result] = await connection.query(QUERY.GET_DISCOUNT_ID, [bookingData.payment.discount_code]);
      discountId = result[0].discount_id;
    }
    else {
      discountId = null;
    }

    const [bookingResult] = await connection.query(QUERY.CREATE_BOOKING,
      [
        bookingData.booking_date,
        bookingData.time_slot,
        bookingData.cleaning_plan || null,
        bookingData.service_type,
        bookingData.special_instructions || "not specified",
        bookingData.hours_count || 0,
        bookingData.payment.subtotal,
        bookingData.payment.discount_amount,
        bookingData.payment.final_price,
        customerId,
        propertyId,
        paymentId,
        discountId || null,
        "submitted",
      ])

    const bookingId = bookingResult.insertId;
    if (bookingData.addons.length > 0) {
      await connection.query(QUERY.CREATE_ADDON, [bookingData.addons.map(addon => [addon.id, addon.count, bookingId])]);
    }


    await connection.commit();
    logger.info(`${req.method} ${req.originalUrl}, booking record created successfully`);
    res.status(HttpStatus.CREATED.code)
      .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Booking created successfully', { bookingId: bookingResult.insertId }));
  }
  catch (err) {
    logger.error("Error during creating booking - " + err.message);
    console.log(err);
    await connection.rollback();
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
      .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Transaction error: ${err.message}`));
  }
  finally {
    connection.release();
  }
}

const oldCreateBooking = async (req, res) => {
  logger.info(`${req.method} ${req.originalUrl}, creating booking`);
  const bookingData = req.body;
  const paymentType = request.body.payment?.payment_type;
  if (!paymentType) {
    throw new Error("Missing 'payment_type'");
  }


  console.log(bookingData);

  try {
    database.getConnection((err, connection) => {
      if (err) {
        logger.error(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
          .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Database connection error: ${err.message}`));
        return;
      }

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          logger.error(err.message);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Transaction error: ${err.message}`));
          return;
        }

        // Create customer
        connection.query(QUERY.CREATE_CUSTOMER,
          [
            bookingData.customer.first_name,
            bookingData.customer.last_name,
            bookingData.customer.email,
            bookingData.customer.phone_number
          ],
          (err, customerResult) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                logger.error(err.message);
                res.status(HttpStatus.BAD_REQUEST.code)
                  .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Error creating customer: ${err.message}`));
              });
            }

            const customerId = customerResult.insertId;

            // Create property
            connection.query(QUERY.CREATE_PROPERTY,
              [
                bookingData.property.property_type,
                bookingData.property.bedrooms_count,
                bookingData.property.bathrooms_count,
                bookingData.property.property_address,
                bookingData.property.postcode,
                bookingData.property.parking_option,
                bookingData.property.entry_access,
                bookingData.property.entry_instruction,
              ],
              (err, propertyResult) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    logger.error(err.message);
                    res.status(HttpStatus.BAD_REQUEST.code)
                      .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Error creating property: ${err.message}`));
                  });
                }

                const propertyId = propertyResult.insertId;

                // Create payment
                connection.query(QUERY.CREATE_PAYMENT,
                  [
                    bookingData.payment.payment_type,
                    bookingData.payment.stripe_payment_id
                  ],
                  (err, paymentResult) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        logger.error(err.message);
                        res.status(HttpStatus.BAD_REQUEST.code)
                          .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Error creating payment: ${err.message}`));
                      });
                    }

                    const paymentId = paymentResult.insertId;

                    const [discount_id] = connection.query(QUERY.GET_DISCOUNT_ID, [bookingData.payment.discount_id]);

                    // Create booking
                    connection.query(QUERY.CREATE_BOOKING,
                      [
                        bookingData.booking_date,
                        bookingData.time_slot,
                        bookingData.cleaningPlan,
                        bookingData.service_type,
                        bookingData.hours_count,
                        bookingData.payment.subtotal,
                        bookingData.payment.discount,
                        bookingData.payment.final_price,
                        customerId,
                        propertyId,
                        paymentId,
                        bookingData.discount_id
                      ],
                      (err, bookingResult) => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            logger.error(err.message);
                            res.status(HttpStatus.BAD_REQUEST.code)
                              .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Error creating booking: ${err.message}`));
                          });
                        }

                        connection.commit(err => {
                          if (err) {
                            return connection.rollback(() => {
                              connection.release();
                              logger.error(err.message);
                              res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, `Error committing transaction: ${err.message}`));
                            });
                          }

                          connection.release();
                          res.status(HttpStatus.CREATED.code)
                            .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Booking created successfully', { bookingId: bookingResult.insertId }));
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  }
  catch (e) {
    logger.error(e.message);
    console.log(e.message);
  }
};

const getBookingRecords = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Fetching booking records`);
    const { config } = req.body;

    let result;
    if (config) {
      //   Validate date
      if (config.startDate || config.endDate) {
        const {startDate, endDate} = config;

        const {valid, message} = validDate(startDate, endDate);
        if (!valid){
            return res.status(HttpStatus.BAD_REQUEST.code).send(
                new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, message)
            );
        }
        logger.info(`Start Date:${startDate}, End Date:${endDate}`);
      }

      const { condition, variables } = getSearchQuery(config);
      [result] = await database.query(condition, variables);
    } else {
      [result] = await database.query(QUERY.GET_ALL_BOOKING);
    }

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
const validDate = (startDate, endDate) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Check format
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return {valid:false, message:"Invalid Date Format."};
    }

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if the dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {valid:false, message:"Invalid Date Value."};
    }

    // Ensure startDate is not later than endDate
    if (start > end) {
        return {valid:false, message:"Start date cannot be later than end date."};
    }

    return {valid: true, message: ""};
}


const validateContact = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Validating customer contact details`);
    const { first_name, phone } = req.body;
    const [result] = await database.query(QUERY.GET_CUSTOMER_BY_PHONE, [phone]);

    if (result.length > 0) {
      if (result[0].first_name == first_name) {
        res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Details validated", { valid: true }))
      }
      else {
        res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, "Details not matched", { valid: false }))
      }
      return;
    }
    res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, "New customer", { valid: true }))
  } catch (err) {
    console.log(err);
    logger.error(`Error validating customer contact details: ${err.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred"))
  }
}

const bookingIdExists = async (bookingId) => {
    const result = await database.query(QUERY.SELECT_BOOKING, bookingId);
    return result[0][0].count !== 0;
}

const editBookingPrice = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Edit booking price`);
    const { bookingId, price } = req.body;
    // check if the booking exists
    if (!await bookingIdExists(bookingId)) {
        return res.status(HttpStatus.NOT_FOUND.code).send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status));
    }
    await database.query(QUERY.EDIT_BOOKING_PRICE, [price, bookingId]);
    res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));
  } catch (err) {
    logger.error(`Error editing booking price: ${err.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred"));
  }
}

const deleteBooking = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Delete booking`);
    const { bookingId } = req.body;
      if (!await bookingIdExists(bookingId)) {
          return res.status(HttpStatus.NOT_FOUND.code).send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status));
      }
    await database.query(QUERY.DELETE_BOOKING, [bookingId]);
    res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));
  } catch (err) {
    logger.error(`Error deleting booking: ${err.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred"));
  }
}

const restoreBooking = async (req, res) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Restore booking`);
    const { bookingId } = req.body;
    await database.query(QUERY.RESTORE_BOOKING, [bookingId]);
    res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));
  } catch (err) {
    logger.error(`Error restoring booking: ${err.message}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, "An error occurred"));
  }
}

module.exports = { createBooking, oldCreateBooking, getBookingRecords, validateContact, editBookingPrice, deleteBooking, restoreBooking };