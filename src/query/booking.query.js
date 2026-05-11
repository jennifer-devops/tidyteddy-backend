const pool = require("../config/mysql.config.js");

const QUERY = {
  GET_ALL_BOOKING: `
        SELECT 
            b.booking_id,
            DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
            b.time_slot,
            b.cleaning_plan,
            b.service_type,
            b.special_instructions,
            b.hours_count,
            b.subtotal,
            b.discount_amount,
            b.final_price,
            b.created_at,
            b.booking_status,
            c.first_name, 
            c.last_name, 
            c.email, 
            c.phone,
            p.property_type, 
            p.property_address, 
            p.postcode, 
            p.parking_option,
            pay.payment_type
        FROM booking b
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN propertys p ON b.property_id = p.property_id
        JOIN payment pay ON b.payment_id = pay.payment_id
        WHERE b.is_deleted = 0
        `,
  // p search
  CREATE_CUSTOMER:
    "INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)",
  CREATE_PROPERTY:
    "INSERT INTO propertys (property_type, bedrooms_count, bathrooms_count, property_address, postcode, parking_option, entry_access, entry_instruction) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  CREATE_PAYMENT:
    "INSERT INTO payment (payment_type, stripe_payment_id) VALUES (?, ?)",
  CREATE_BOOKING: `
        INSERT INTO booking (
            booking_date, time_slot, cleaning_plan, service_type, special_instructions, hours_count,
            subtotal, discount_amount, final_price, customer_id,
            property_id, payment_id, discount_id, booking_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  CREATE_ADDON: `INSERT INTO bookingAddon (addon_id, addon_quantity, booking_id) VALUES ?`,

  // update function
  UPDATE_BOOKING_STATUS: `
        UPDATE booking 
        SET booking_status = ?
        WHERE booking_id = ?
    `,
  GET_DISCOUNT_ID: `SELECT discount_id FROM discount WHERE discount_code = ?`,
  GET_CUSTOMER_BY_PHONE: `SELECT customer_id, first_name FROM customers WHERE phone = ?`,
  EDIT_BOOKING_PRICE: `UPDATE booking SET final_price = ? WHERE booking_id = ?`,
  DELETE_BOOKING: `UPDATE booking SET is_deleted = 1 WHERE booking_id = ?`,
  RESTORE_BOOKING: `UPDATE booking SET is_deleted = 0 WHERE booking_id = ?`,
};

const getSearchQuery = (config) => {
  const base = `SELECT 
            b.booking_id,
            DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
            b.time_slot,
            b.cleaning_plan,
            b.service_type,
            b.special_instructions,
            b.hours_count,
            b.subtotal,
            b.discount_amount,
            b.final_price,
            b.created_at,
            b.booking_status,
            b.is_deleted,
            c.first_name, 
            c.last_name, 
            c.email, 
            c.phone,
            p.property_type, 
            p.property_address, 
            p.postcode, 
            p.parking_option,
            pay.payment_type
        FROM booking b
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN propertys p ON b.property_id = p.property_id
        JOIN payment pay ON b.payment_id = pay.payment_id`;
  let condition = [];
  const variables = [];
  if (config.startDate && config.endDate) {
    condition.push(`(b.booking_date BETWEEN ? AND ?)`);
    variables.push(config.startDate);
    variables.push(config.endDate);
  }
  if (config.status) {
    condition.push(
      `(${config.status.map((s) => `b.booking_status = "${s}"`).join(" OR ")})`
    );
  }
  if (config.firstName) {
    condition.push(`(c.first_name LIKE ?)`);
    variables.push(config.firstName);
  }
  if (config.lastName) {
    condition.push(`(c.last_name LIKE ?)`);
    variables.push(config.lastName);
  }
  if (config.phone) {
    condition.push(`(c.phone LIKE ?)`);
    variables.push(config.phone);
  }
  if (config.email) {
    condition.push(`(c.email LIKE ?)`);
    variables.push(config.email);
  }
  condition.push("(b.is_deleted = 0)");
  return {
    condition:
      base + (condition.length > 0 ? " WHERE " + condition.join(" AND ") : ""),
    variables,
  };
};

const insertBooking = async (bookingData) => {
  const conn = await pool.getConnection();
  try {
    console.log("Query: Starting database transaction");
    await conn.beginTransaction();

    // 1. Insert customer
    console.log("Query: Processing customer data...");
    let customerResult;
    try {
      const [existingCustomers] = await conn.query(
        "SELECT customer_id FROM customers WHERE phone = ?",
        [bookingData.contactDetails.phoneNum]
      );

      if (existingCustomers.length > 0) {
        console.log("Query: Existing customer found, using existing ID");
        customerResult = {
          insertId: existingCustomers[0].customer_id,
        };
      } else {
        [customerResult] = await conn.query("INSERT INTO customers SET ?", {
          first_name: bookingData.contactDetails.firstName,
          last_name: bookingData.contactDetails.lastName,
          email: bookingData.contactDetails.email,
          phone: bookingData.contactDetails.phoneNum,
        });
        console.log(
          "Query: New customer created successfully:",
          customerResult
        );
      }
    } catch (error) {
      throw {
        message: "Error processing customer data",
        sqlError: error.sqlMessage,
        code: error.code,
        step: "customer_process",
      };
    }

    // 2. Insert property
    console.log("Query: Inserting property data...");
    let propertyResult;
    try {
      [propertyResult] = await conn.query("INSERT INTO propertys SET ?", {
        property_type: bookingData.propertyType,
        bedrooms_count: bookingData.bedRoomNum,
        bathrooms_count: bookingData.bathRoomNum,
        property_address: bookingData.address,
        postcode: bookingData.cbdStatus.postcode,
        parking_option: bookingData.parkingOption,
        entry_access: bookingData.homeStatus,
        entry_instruction: bookingData.homeAccessInstructions || null,
      });
      console.log("Query: Property inserted successfully:", propertyResult);
    } catch (error) {
      throw {
        message: "Error inserting property data",
        sqlError: error.sqlMessage,
        code: error.code,
        step: "property_insert",
      };
    }

    // 3. Insert payment
    console.log("Query: Inserting payment data...");
    let paymentResult;
    try {
      [paymentResult] = await conn.query("INSERT INTO payment SET ?", {
        payment_type: bookingData.payment_type,
        stripe_payment_id: bookingData.stripe_payment_id,
      });
      console.log("Query: Payment inserted successfully:", paymentResult);
    } catch (error) {
      throw {
        message: "Error inserting payment data",
        sqlError: error.sqlMessage,
        code: error.code,
        step: "payment_insert",
      };
    }

    // 4. Insert discount
    console.log("Query: Handling discount...");
    let discountResult;
    try {
      if (bookingData.discountCode) {
        [discountResult] = await conn.query("INSERT INTO discount SET ?", {
          discount_code: bookingData.discountCode,
          discount_type: "fixed",
          discount_value: 0,
          expiration_date: "2099-12-31",
        });
      } else {
        [discountResult] = await conn.query("INSERT INTO discount SET ?", {
          discount_code: "NO_DISCOUNT",
          discount_type: "fixed",
          discount_value: 0,
          expiration_date: "2099-12-31",
        });
      }
      console.log("Query: Discount handled successfully:", discountResult);
    } catch (error) {
      throw {
        message: "Error handling discount",
        sqlError: error.sqlMessage,
        code: error.code,
        step: "discount_insert",
      };
    }

    // 5. Insert booking
    console.log("Query: Inserting booking data...");
    let bookingResult;
    try {
      console.log("Calculating hours...");
      console.log("Service Type:", bookingData.serviceType);
      console.log("Cleaning Hours:", bookingData.cleaningHours);
      console.log("Property Type:", bookingData.propertyType);

      let hours = 0;
      if (
        bookingData.serviceType === "Hourly Cleaning" &&
        bookingData.cleaningHours
      ) {
        const propertyType = bookingData.propertyType;
        hours = bookingData.cleaningHours[propertyType] || 0;
        console.log("Hours for Hourly Cleaning:", hours);
      }

      const bookingInsertData = {
        booking_date: new Date(bookingData.selectedDate),
        time_slot: bookingData.selectedTime,
        cleaning_plan: bookingData.selectedPlan.title,
        service_type: bookingData.serviceType,
        special_instructions: bookingData.specialInstructions,
        hours_count: hours,
        subtotal: bookingData.selectedPlan.price,
        discount_amount: 0,
        final_price: bookingData.selectedPlan.price,
        customer_id: customerResult.insertId,
        property_id: propertyResult.insertId,
        discount_id: discountResult.insertId,
        payment_id: paymentResult.insertId,
      };

      console.log("Attempting to insert booking with data:", bookingInsertData);

      [bookingResult] = await conn.query(
        "INSERT INTO booking SET ?",
        bookingInsertData
      );
      console.log("Query: Booking inserted successfully:", bookingResult);
    } catch (error) {
      console.error("Detailed error:", error);
      throw {
        message: "Error inserting booking data",
        sqlError: error.sqlMessage,
        code: error.code,
        step: "booking_insert",
        originalError: error,
      };
    }

    // 6. Insert booking addons
    if (bookingData.addons && bookingData.addons.length > 0) {
      console.log("Query: Inserting booking addons...");
      try {
        for (const addon of bookingData.addons) {
          await conn.query("INSERT INTO bookingAddon SET ?", {
            addon_quantity: addon.count,
            booking_id: bookingResult.insertId,
            addon_id: addon.id,
          });
        }
        console.log("Query: Booking addons inserted successfully");
      } catch (error) {
        throw {
          message: "Error inserting booking addons",
          sqlError: error.sqlMessage,
          code: error.code,
          step: "booking_addon_insert",
        };
      }
    }

    await conn.commit();
    console.log("Query: Transaction committed successfully");
    return {
      success: true,
      bookingId: bookingResult.insertId,
      message: "Booking created successfully",
    };
  } catch (error) {
    console.error("Query Error Details:");
    console.error("- Step:", error.step);
    console.error("- Message:", error.message);
    console.error("- SQL Error:", error.sqlError);
    console.error("- Code:", error.code);

    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = { QUERY, insertBooking, getSearchQuery };
