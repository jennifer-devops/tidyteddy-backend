const database = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const QUERY = require('../query/customer.query.js');
const HttpStatus = require('../controller/controller.js');

//get all the customers
const getCustomers = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching customers`);
    try {
        const [rows] = await database.query(QUERY.SELECT_CUSTOMERS);
        if (rows.length === 0) {
            res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No customers found.'));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Customers found.', rows));
        }
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Database query failed.'));
    }
    database.releaseConnection();
};

// //create a new customer
const createCustomer = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, creating customers`);
    const { first_name, last_name, email, phone } = req.body;
    
    // Check if all required fields are provided
    if (!first_name || !phone) {
        return res.status(400).json({ message: 'First name and phone are required' });
    }

    try {
        // Insert customer data into the database
        const [result] = await database.query(QUERY.CREATE_CUSTOMER, [first_name, last_name, email, phone]);

        if (result.affectedRows > 0) {
            // Return 201 Created status and response with customer_id
            res.status(HttpStatus.CREATED.code)
                .send(new Response(HttpStatus.CREATED.code, HttpStatus.CREATED.status, 'Customer created successfully.', { customer_id: result.insertId }));
        } else {
            // If no rows were affected, return 404 Not Found
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'Customer creation failed.'));
        }
    } catch (error) {
        logger.error(error.message);
        // Return 500 Internal Server Error if there's a problem
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Database query failed.'));
    }
    database.releaseConnection();
};


//get sigle customer by id
const getCustomer = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching customer by id ${req.params.customer_id}`);
    try {
        const [rows] = await database.query(QUERY.SELECT_CUSTOMER, [req.params.customer_id]);
        if(!rows[0]){
            res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No customers found.'));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Customers found.', rows[0]));
        }
    }
    catch (error) {
        logger.error(error.message);
    }

    
    database.releaseConnection();
};

//get customer by phone number
const getCustomerByPhone = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching customer by phone ${req.params.phone}`);
    try {
        const [rows] = await database.query(QUERY.SELECT_CUSTOMER_BY_PHONE, [req.params.phone]);
        if(!rows[0]){
            res.status(HttpStatus.NOT_FOUND.code)
            .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No customers found.'));
        } else {
            res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Customers found.', rows[0]));
        }
    } catch (error) {
        logger.error(error.message);
    }
    database.releaseConnection();
};

const getCustomerByName = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, fetching customer by name ${req.params.first_name}`);
    try {
        const [rows] = await database.query(QUERY.SELECT_CUSTOMER_BY_NAME, [req.params.first_name]);

        // Check if no customers were found
        if (rows.length === 0) {
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, 'No customers found.'));
        } else {
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Customers found.', rows));  // Return all matched customers
        }
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Database query failed.'));
    }
    database.releaseConnection();
};


//update a customer 
const updateCustomer = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, updating customer by id ${req.params.customer_id}`);
    try {
        // First check if customer exists and get current data
        const [rows] = await database.query(QUERY.SELECT_CUSTOMER, [req.params.customer_id]);
        
        if (!rows[0]) {
            // If customer not found, return NOT_FOUND status
            return res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `No customer found with id ${req.params.customer_id}.`));
        }
        
        // Get current customer data
        const currentCustomer = rows[0];
        
        // Merge current data with updates from req.body
        // This supports partial updates - only provided fields will be updated
        const updatedData = {
            first_name: req.body.first_name !== undefined ? req.body.first_name : currentCustomer.first_name,
            last_name: req.body.last_name !== undefined ? req.body.last_name : currentCustomer.last_name,
            email: req.body.email !== undefined ? req.body.email : currentCustomer.email,
            phone: req.body.phone !== undefined ? req.body.phone : currentCustomer.phone
        };
        
        // Check if there are any changes
        const hasChanges = ['first_name', 'last_name', 'email', 'phone'].some(
            field => req.body[field] !== undefined && req.body[field] !== currentCustomer[field]
        );
        
        // If no changes were provided, return early
        if (!hasChanges) {
            return res.status(HttpStatus.OK.code)
                .send(new Response(
                    HttpStatus.OK.code, 
                    HttpStatus.OK.status, 
                    'No changes detected. Customer remains unchanged.',
                    {id: req.params.customer_id, ...currentCustomer}
                ));
        }
        
        // Execute the update with merged data
        const [result] = await database.query(
            QUERY.UPDATE_CUSTOMER, 
            [updatedData.first_name, updatedData.last_name, updatedData.email, updatedData.phone, req.params.customer_id]
        );
        
        // Check if update was successful
        if (result.affectedRows > 0) {
            res.status(HttpStatus.OK.code)
                .send(new Response(
                    HttpStatus.OK.code, 
                    HttpStatus.OK.status, 
                    'Customer updated successfully.', 
                    {id: req.params.customer_id, ...updatedData}
                ));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code, 
                    HttpStatus.INTERNAL_SERVER_ERROR.status, 
                    'Failed to update customer.'
                ));
        }
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(
                HttpStatus.INTERNAL_SERVER_ERROR.code, 
                HttpStatus.INTERNAL_SERVER_ERROR.status, 
                'Database query failed.'
            ));
    } finally {
        database.releaseConnection();
    }
};

//delete a customer
const deleteCustomer = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, deleting customer by id ${req.params.customer_id}`);
    try {
        // First check if customer exists
        const [checkRows] = await database.query(QUERY.SELECT_CUSTOMER, [req.params.customer_id]);
        
        if (!checkRows[0]) {
            // If customer not found, return NOT_FOUND status
            return res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(
                    HttpStatus.NOT_FOUND.code, 
                    HttpStatus.NOT_FOUND.status, 
                    `Customer not found with id ${req.params.customer_id}.`
                ));
        }
        
        // If customer exists, proceed with delete operation
        const [result] = await database.query(QUERY.DELETE_CUSTOMER, [req.params.customer_id]);
        
        // Check if delete was successful
        if (result.affectedRows > 0) {
            res.status(HttpStatus.OK.code)
                .send(new Response(
                    HttpStatus.OK.code, 
                    HttpStatus.OK.status, 
                    `Customer deleted successfully`,
                    { id: req.params.customer_id }
                ));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code, 
                    HttpStatus.INTERNAL_SERVER_ERROR.status, 
                    'Failed to delete customer.'
                ));
        }
    } catch (error) {
        logger.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(
                HttpStatus.INTERNAL_SERVER_ERROR.code, 
                HttpStatus.INTERNAL_SERVER_ERROR.status, 
                'Database query failed.'
            ));
    } finally {
        database.releaseConnection();
    }
};

module.exports = { getCustomers, createCustomer, getCustomer, getCustomerByPhone, getCustomerByName, updateCustomer, deleteCustomer };