const QUERY = {
    SELECT_CUSTOMERS: 'SELECT * FROM customers ORDER BY customer_id DESC',
    SELECT_CUSTOMER: 'SELECT * FROM customers WHERE customer_id = ?',
    SELECT_CUSTOMER_BY_PHONE: 'SELECT * FROM customers WHERE phone = ?',
    SELECT_CUSTOMER_BY_NAME: 'SELECT * FROM customers WHERE first_name = ?',
    CREATE_CUSTOMER: 'INSERT INTO customers(first_name, last_name, email, phone) VALUES (?, ?, ?, ?) ',
    UPDATE_CUSTOMER: 'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE customer_id  = ?',
    DELETE_CUSTOMER: 'DELETE FROM customers WHERE customer_id  = ?',
};
module.exports = QUERY;
