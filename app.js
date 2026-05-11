const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const pool = require("./src/config/mysql.config.js");
const HttpStatus = require("./src/controller/controller.js");
const dotenv = require("dotenv");
const cors = require("cors");
const Response = require("./src/domain/response.js");

// Booking system routes
const discountCheckingRoutes = require("./routes/discountCheckingRoutes.js");
const stripeRoutes = require("./routes/stripeRoutes.js");

// Admin routes
const customerRoutes = require("./routes/customerRoutes.js");
const authRoutes = require("./routes/auth.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const propertyTypePriceRoutes = require("./routes/propertyTypePriceRoutes.js");
const addonRoutes = require("./routes/addonRoutes.js");
const permanentStaffRoutes = require("./routes/permanentStaffRoutes.js");
const discountRoutes = require("./routes/adminRoutes/discountRoutes.js");
const timesheetRoutes = require("./routes/timesheetRoute.js");
const contractorRoutes = require("./routes/contractorStaffRoutes.js");
const bookingPublicRouter = require("./routes/bookingPublicRoutes.js");
const apiRoutes = require("./routes/apiRoutes.js");

const app = express();
const PORT = process.env.PORT || 8081;

// Initialize dotenv
dotenv.config({ path: "./.env" });

// Disable console.log in production
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
}

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://www.tidyteddy.com.au"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

async function initializeAddOnData(conn) {
  try {
    await conn.beginTransaction();

    const sqlFilePath = path.join(__dirname, "mysql", "seeds", "addOnSeed.sql");
    const sqlContent = await fs.readFile(sqlFilePath, "utf-8");
    await conn.query(sqlContent);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  }
}

async function initializePropertyTypePriceData(conn) {
  try {
    const [rows] = await conn.query(
      "SELECT COUNT(*) as count FROM propertyTypePrice",
    );

    if (rows[0].count === 0) {
      const sqlFilePath = path.join(
        __dirname,
        "mysql",
        "seeds",
        "propertyTypePriceSeed.sql",
      );
      const sqlContent = await fs.readFile(sqlFilePath, "utf-8");
      await conn.query(sqlContent);
    }
  } catch (error) {
    throw error;
  }
}

async function initializeData(conn, tableName) {
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`SELECT * FROM ${tableName}`);
    if (result.length === 0) {
      const sqlFilePath = path.join(
        __dirname,
        "mysql",
        "seeds",
        `${tableName}Seed.sql`,
      );
      const sqlContent = await fs.readFile(sqlFilePath, "utf-8");
      await conn.query(sqlContent);
      await conn.commit();
    }
  } catch (error) {
    await conn.rollback;
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    const tables = [
      { name: "customers", file: "/mysql/init_table0.sql" },
      { name: "payment", file: "/mysql/init_table4.sql" },
      { name: "addOn", file: "/mysql/init_table2.sql" },
      { name: "discount", file: "/mysql/init_table3.sql" },
      { name: "propertys", file: "/mysql/init_table1.sql" },
      { name: "booking", file: "/mysql/init_table5.sql" },
      { name: "bookingAddon", file: "/mysql/init_table6.sql" },
      { name: "staff", file: "/mysql/init_table7.sql" },
      { name: "timesheet", file: "/mysql/init_table8.sql" },
      { name: "schedule", file: "/mysql/init_table9.sql" },
      { name: "propertyTypePrice", file: "/mysql/init_table10.sql" },
      { name: "leaveRequest", file: "/mysql/init_table11.sql" },
      { name: "bookingHistory", file: "/mysql/init_table12.sql" },
    ];

    for (const { name, file } of tables) {
      const sqlFilePath = path.join(__dirname, file);
      const sqlContent = await fs.readFile(sqlFilePath, "utf-8");
      const [existingTables] = await conn.execute(`SHOW TABLES LIKE '${name}'`);

      if (existingTables.length === 0) {
        await conn.execute(sqlContent);

        const seedableTable = [
          "customers",
          "payment",
          "discount",
          "propertys",
          "booking",
        ];
        if (seedableTable.includes(name)) {
          await initializeData(conn, name);
        }

        if (name === "addOn") {
          await initializeAddOnData(conn);
        }

        if (name === "propertyTypePrice") {
          await initializePropertyTypePriceData(conn);
        }
      }
    }

    return true;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// Start the server
async function startServer() {
  try {
    app.get("/config", (req, res) => {
      res.json({
        apiBaseUrl: process.env.VITE_API_BASE_URL,
        googleMapsKey: process.env.VITE_GOOGLE_MAPS_API_KEY,
        web3FormsKey: process.env.VITE_WEB3FORMS_KEY,
      });
    });

    // Routes
    app.use("/", bookingPublicRouter);
    app.use("/admin5173", customerRoutes);
    app.use("/admin5173", propertyTypePriceRoutes);
    app.use("/admin5173", addonRoutes);
    app.use("/admin5173", bookingRoutes);
    app.use("/checking", discountCheckingRoutes);
    app.use("/admin5173", discountRoutes);
    app.use("/admin-auth", authRoutes);
    app.use("/admin5173", paymentRoutes);
    app.use("/admin5173", permanentStaffRoutes);
    app.use("/admin5173", timesheetRoutes);
    app.use("/admin5173", contractorRoutes);
    app.use("/stripe", stripeRoutes);
    app.use("/", apiRoutes);

    // Serve frontend
    // app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // app.get("*", (req, res) => {
    //   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    // });

    // Default route for unmatched paths
    app.all("*", (req, res) => {
      res
        .status(HttpStatus.NOT_FOUND.code)
        .send(
          new Response(
            HttpStatus.NOT_FOUND.code,
            HttpStatus.NOT_FOUND.status,
            "Route not found.",
          ),
        );
    });

    // Listen to the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on: ${PORT}`);
    });

    try {
      await initializeDatabase();
      console.log("Database initialized");
    } catch (error) {
      console.error("Database init failed:", error);
    }
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
