const DISCOUNTCHECKINGQUERY = {
    FOUND_DISCOUNT: 'SELECT * FROM discount',
    FOUND_VALUE_BY_CODE: 'SELECT discount_value, expiration_date, discount_type FROM discount WHERE discount_code = ?',
    SELECT_DISCOUNT_BY_ID: 'SELECT * FROM discount WHERE discount_id = ?',
}
module.exports = DISCOUNTCHECKINGQUERY;