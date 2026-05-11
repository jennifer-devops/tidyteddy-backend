//Users/fangshi/site-backend/src/controller/discount.controller.js
const discountQuery = require("../query/discount.query.js");
const HttpStatus = require("./controller.js");
const { convertToDate } = require("../utils/timezoneUtils.js");
// Helper function for validation
const validateDiscount = ({
  discount_code,
  discount_type,
  discount_value,
  expiration_date,
}) => {
  if (!discount_code || typeof discount_code !== "string")
    return "Invalid discount_code.";
  if (!["fixed", "percentage"].includes(discount_type))
    return "Invalid discount_type.";
  if (typeof discount_value !== "number" || discount_value < 0)
    return "Invalid discount_value.";
  if (expiration_date && isNaN(Date.parse(expiration_date)))
    return "Invalid expiration_date.";
  return null;
};

// Get all discounts
const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await discountQuery.getAllDiscounts();
    res.status(HttpStatus.OK.code).json({ success: true, discounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to fetch discounts.",
      details: error.message,
    });
  }
};

// Search discounts by time period
const searchDiscounts = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const discounts = await discountQuery.searchDiscounts(startDate, endDate);
    res.status(HttpStatus.OK.code).json({ success: true, discounts });
  } catch (error) {
    console.error("Error searching discounts:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to search discounts.",
      details: error.message,
    });
  }
};

// Create a new discount
const createDiscount = async (req, res) => {
  const { discount_code, discount_type, discount_value, expiration_date } =
    req.body;

  const validationError = validateDiscount({
    discount_code,
    discount_type,
    discount_value,
    expiration_date,
  });
  if (validationError) {
    return res
      .status(HttpStatus.BAD_REQUEST.code)
      .json({ success: false, error: validationError });
  }

  try {
    const newDiscount = await discountQuery.createDiscount({
      discount_code,
      discount_type,
      discount_value,
      expiration_date,
    });
    res
      .status(HttpStatus.CREATED.code)
      .json({ success: true, discount: newDiscount });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to create discount.",
      details: error.message,
    });
  }
};

// Update a discount
const updateDiscount = async (req, res) => {
  const { discount_id } = req.params;
  const { discount_code, discount_type, discount_value, expiration_date } =
    req.body;

  // Convert discount_value to a number using parseFloat
  const parsedDiscountValue = parseFloat(discount_value);

  // Validate if discount_value is a valid number
  if (isNaN(parsedDiscountValue)) {
    return res.status(HttpStatus.BAD_REQUEST.code).json({
      success: false,
      error: "Invalid discount_value. It must be a number.",
    });
  }

  // Continue with the validation and update logic using the parsed discount value
  const validationError = validateDiscount({
    discount_code,
    discount_type,
    discount_value: parsedDiscountValue,
    expiration_date,
  });
  if (validationError) {
    return res
      .status(HttpStatus.BAD_REQUEST.code)
      .json({ success: false, error: validationError });
  }

  try {
    const updatedDiscount = await discountQuery.updateDiscount(discount_id, {
      discount_code,
      discount_type,
      discount_value: parsedDiscountValue, // Use the parsed discount_value
      expiration_date,
    });
    res
      .status(HttpStatus.OK.code)
      .json({ success: true, discount: updatedDiscount });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to update discount.",
      details: error.message,
    });
  }
};

// Delete a discount
const deleteDiscount = async (req, res) => {
  const { discount_id } = req.params;
  try {
    await discountQuery.deleteDiscount(discount_id);
    res
      .status(HttpStatus.OK.code)
      .json({ success: true, message: "Discount deleted successfully." });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to delete discount.",
      details: error.message,
    });
  }
};

// Validate a discount code
const validateDiscountCode = async (req, res) => {
  const { discount_code } = req.params;

  if (!discount_code) {
    return res.status(HttpStatus.BAD_REQUEST.code).json({
      success: false,
      error: "Discount code is required.",
    });
  }

  try {
    // Fetch the discount by code
    const discount = await discountQuery.getDiscountByCode(discount_code);

    // Check if the discount exists
    if (!discount) {
      return res.status(HttpStatus.NOT_FOUND.code).json({
        success: false,
        error: "Discount code not found.",
      });
    }

    // Check if the discount is expired
    if (discount.expiration_date) {
      const date = convertToDate(new Date().toISOString());
      const expirationDate = convertToDate(discount.expiration_date);

      if (expirationDate < date) {
        return res.status(HttpStatus.GONE.code).json({
          success: false,
          error: "Discount code is expired.",
        });
      }
    }
    // Return valid discount
    return res.status(HttpStatus.OK.code).json({
      success: true,
      discount: {
        discount_code: discount.discount_code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        expiration_date: discount.expiration_date,
      },
    });
  } catch (error) {
    console.error("Error validating discount code:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      error: "Failed to validate discount code.",
      details: error.message,
    });
  }
};

module.exports = { getAllDiscounts, searchDiscounts, createDiscount, updateDiscount, deleteDiscount, validateDiscountCode };