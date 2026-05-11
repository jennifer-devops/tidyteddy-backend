//use payment id to find payment details, and use payment information to find customer info or booking information

const PAYMENTQUERY ={
   
    SELECT_BOOKING_BY_PAYMENT_ID: "SELECT * FROM booking b "
    + " join payment p on b.payment_id = p.payment_id"
    + " join customers c on b.customer_id = c.customer_id"
    + " join propertys pr on pr.property_id = b.property_id"
    + " where p.payment_id = ?"
};

module.exports = PAYMENTQUERY