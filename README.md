# TidyTeddy Backend

## Project Overview

This backend service powers the TidyTeddy platform. It handles tasks such as timesheet management, booking validation, and staff assignments. The service is built with Node.js and uses a MySQL database running in a Docker container.

## Prerequisites

- Git
- Docker Desktop (download and open it)
- Node.js (v14 or later) and npm

### Notes for Mac or Linux Users
- Open the `docker-compose.yml` file and uncomment the specified line as instructed.
- Follow the same steps as outlined above for setting up and testing the connection.

## Installation and Setup

1. **Create a New Folder and Open a Terminal.**

2. **Clone the Repository:**

   ```bash
   git clone https://github.com/tidyteddy/backend.git
   ```

3. **Download and Launch Docker Desktop.**

4. **Install Node Dependencies:**

   ```bash
   npm install
   ```

5. **Initialize the Docker MySQL Server:**

   ```bash
   docker compose up
   ```

6. **Set Up the Environment:**

   Install the environment package by running:
   
   ```bash
   npm install cross-env --save-dev
   ```

7. **Configure Environment Variables:**

   - Copy the `.env` file provided in the Discord file channel and paste it into the cloned folder.

8. **Start the Application:**

   In a separate terminal, run:
   
   ```bash
   npm run start:dev
   ```
   
   or
   
   ```bash
   nodemon index.js
   ```

9. **Create Database Tables:**

   Follow the instructions in the code to create the necessary database tables.

10. **Verify Backend Operation:**

    Access the backend at [http://localhost:8080](http://localhost:8080), log in, and verify that the tables have been created correctly.

## Project Structure

```
backend/
├── mysql
│   └── seeds                # SQL seed files used to populate the database with initial data.
├── routes
│   └── adminRoutes          # API route definitions specifically for administrative functionalities.
└── src
    ├── config               # Configuration files for the backend application (database, server, etc.).
    ├── controller           # Logic for handling incoming requests and orchestrating responses (request handlers).
    ├── domain               # Contains core business logic, domain models, or entities of the application.
    ├── logging              # Modules and configurations for logging application events and errors.
    ├── middleware           # Middleware functions for request processing (authentication, authorization, etc.).
    ├── query                # Modules responsible for database queries and data access (data access layer).
    └── utils                # Utility functions, helper classes, or shared modules for the backend.
```


## Production Testing Steps

After you have set up and tested the backend in development mode, follow these additional steps for production testing:

1. **Build the Frontend for Production:**
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     npm install
     npm run build
     ```
   - This will generate a `dist` folder with the production build of your frontend.

2. **Configure the Express Server for Production:**
   - Ensure your Express server in `site-backend/index.js` is set up to serve static files from the Vite build. The relevant code should look like:
     ```js
     // Serve static files
     app.use(express.static(path.join(__dirname, '../frontend/dist')));

     // All other GET requests return the index.html for client-side routing
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
     });
     ```
   - Make sure all your API routes are defined **before** these static and catch-all routes. This ensures API calls work correctly without serving `index.html`.

3. **Set Environment Variables for Production:**
   - Create or update a `.env` file in the `site-backend` directory with production variables:
     ```
     NODE_ENV=production
     SERVER_PORT=8081
     # other variables as needed
     ```
   - Confirm that your code loads these variables using:
     ```js
     dotenv.config();
     ```

4. **Start the Application in Production Mode:**
   - From the `site-backend` directory, run:
     ```bash
     npm run start:prod
     ```
   - This command should use the `cross-env NODE_ENV=production` setup in your package.json.

5. **Test Production Endpoints:**
   - Open a browser and navigate to `http://localhost:8081`.  
   - Confirm the frontend loads correctly from the production build.
   - Test an API endpoint directly, for example:
     ```
     http://localhost:8081/admin5173/discount/validate/SUMMER2025
     ```
     - You should receive a valid JSON response, not the homepage HTML.
   - If needed, use a tool like Postman or cURL to verify responses from various API endpoints.

6. **Troubleshoot if Needed:**
   - If API routes are returning the `index.html` instead of the expected data, ensure that:
     - All API routes are declared before the static file serving and catch-all route.
     - The paths to static files and API endpoints are correct.
     - Environment variables are loaded appropriately and your server is in production mode.

## Testing Method

Follow these steps to test the backend with the database setup using Docker and MySQL:

1. **Open Docker:**
   - Ensure Docker is running on your machine.

2. **Environment Setup:**
   - Run the command:
     ```bash
     npm install cross-env --save-dev
     ```
     to install necessary dependencies.

3. **Database Connection:**
   - Connect to the MySQL container:
     ```bash
     docker exec -it tidyteddy_web_db mysql -u tidyteddy -ppassword
     ```

4. **Reset Database:**
   - Once connected to MySQL, execute the following commands to drop and recreate the database:
     ```sql
     DROP DATABASE tidyteddy_web_db;
     CREATE DATABASE tidyteddy_web_db;
     USE tidyteddy_web_db;
     ```

5. **Uncomment Table Creation in Code:**
   - In `index.js` or the relevant initialization script, uncomment the lines that create the necessary tables.

6. **Start the Application:**
   - Run:
     ```bash
     npm run start:dev
     ```
     to start the server in development mode. This should also execute the seeding process if applicable.

7. **Test Data Insertion:**
   - Use the following JSON payload to test creating a booking:
     ```json
     {
         "customer": {
             "first_name": "John",
             "last_name": "Doe",
             "email": "john.doe@example.com",
             "phone_number": "1234567890"
         },
         "property": {
             "property_type": "house",
             "property_address": "123 Main St",
             "postcode": 1234,
             "parking_option": "driveway",
             "entry_access": "at_home"
         },
         "service": {
             "service_type": "daily",
             "bathrooms": 2,
             "hours": 3
         },
         "booking_date": "2024-12-1", 
         "cleaningPlan": "weekly",
         "payment": {
             "payment_type": "Credit Card",
             "subtotal": 150.00,
             "discount": 0.00,
             "final_price": 150.00
         }
     }
     ```
   - Post the data to:
     ```
     POST http://localhost:8081/api/bookings
     ```

8. **Retrieve Data:**
   - To retrieve booking data, use the booking ID from the created booking (for instance, booking ID 22). Send a GET request to:
     ```
     GET http://localhost:8081/api/bookings/22
     ```
   - Verify that the data returned matches the test input and expected output.

## Troubleshooting

- If installation issues occur, try deleting the `node_modules` folder and running `npm install` again.
- Make sure Docker Desktop is running and properly configured.
- Verify that the `.env` file is correctly placed and contains the correct configuration.

## License

This project is licensed under the [MIT License](LICENSE).