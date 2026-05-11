//Users/fangshi/site-backend/src/query/discount.query.js
const pool = require('../config/mysql.config.js')

// Get all discounts
const getAllDiscounts = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM discount");
        return rows;
    } catch (error) {
        console.error("Error fetching discounts:", error.message);
        throw new Error("Failed to fetch discounts.");
    }
};

// Search discounts by time period
const searchDiscounts = async (startDate, endDate) => {
    try {
        const query = `
            SELECT * FROM discount 
            WHERE (expiration_date >= ? OR ? IS NULL) 
              AND (expiration_date <= ? OR ? IS NULL)
        `;
        const [rows] = await pool.query(query, [startDate || null, startDate || null, endDate || null, endDate || null]);
        return rows;
    } catch (error) {
        console.error("Error searching discounts by time period:", error.message);
        throw new Error("Failed to search discounts.");
    }
};

// Create a new discount
const createDiscount = async (discount) => {
    try {
        const query = `
            INSERT INTO discount (discount_code, discount_type, discount_value, expiration_date)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            discount.discount_code,
            discount.discount_type,
            discount.discount_value,
            discount.expiration_date || null,
        ]);
        return { discount_id: result.insertId, ...discount };
    } catch (error) {
        console.error("Error creating discount:", error.message);
        throw new Error("Failed to create discount.");
    }
};

// Update a discount
const updateDiscount = async (discount_id, discount) => {
    try {
        console.log("Updating discount with ID:", discount_id); 
        const query = `
            UPDATE discount 
            SET discount_code = ?, discount_type = ?, discount_value = ?, expiration_date = ?
            WHERE discount_id = ?
        `;
        const [result] = await pool.query(query, [
            discount.discount_code,
            discount.discount_type,
            discount.discount_value,
            discount.expiration_date || null,
            discount_id,
        ]);
        if (result.affectedRows === 0) {
            throw new Error(`No discount found with ID ${discount_id}`);
        }
        return { discount_id, ...discount };
    } catch (error) {
        console.error("Error updating discount:", error.message);
        throw new Error("Failed to update discount.");
    }
};

// Delete a discount
const deleteDiscount = async (discount_id) => {
    try {
        const query = "DELETE FROM discount WHERE discount_id = ?";
        const [result] = await pool.query(query, [discount_id]);
        if (result.affectedRows === 0) {
            throw new Error(`No discount found with ID ${discount_id}`);
        }
    } catch (error) {
        console.error("Error deleting discount:", error.message);
        throw new Error("Failed to delete discount.");
    }
};

// Get a discount by code
const getDiscountByCode = async (discount_code) => {
    const query = "SELECT * FROM discount WHERE discount_code = ?";
    const [rows] = await pool.query(query, [discount_code]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0];
};
module.exports = { getAllDiscounts, searchDiscounts, createDiscount, updateDiscount, deleteDiscount, getDiscountByCode};
