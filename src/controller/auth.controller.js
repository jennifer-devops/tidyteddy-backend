const pool = require('../config/mysql.config.js');
const Response = require('../domain/response.js');
const logger = require('../logging/logger.js');
const STAFF_QUERY = require('../query/staff.query.js');
const HttpStatus = require('./controller.js');

const crypto = require('crypto');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const codeStore = new Map();

function generateCode() {
    return crypto.randomInt(100000, 999999).toString();
}

async function generateBcryptHash(plainTextPassword) {
    const saltRounds = 10;
    try {
        const hash = await bcrypt.hash(plainTextPassword, saltRounds);
        console.log('Generated bcrypt Hash:', hash);
        return hash;
    } catch (error) {
        console.error('Error generating bcrypt hash:', error);
    }
}

//============================method begin===========================================

const authLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log("req.body is= " + req.body.password);
    if (!username || !password) {
        return res.status(400).json({ message: 'username or password missing' });
    }
    logger.info(`${req.method} ${req.originalUrl}, authenticating admin by username : ${username}`);

    try {
        const [rows] = await pool.execute(STAFF_QUERY.SELECT_STAFF_BY_USERNAME, [username]);

        if (rows.length <= 0) {
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Username is not exist.`));
        } else {
            //logger.info(`password=|${password}|`)
            const match = await bcrypt.compare(password, rows[0].password_hash);
            //logger.info(`rows[0].password_hash=|${rows[0].password_hash}|`)
            if (match) {

                const token = jwt.sign(
                    {
                        username: rows[0].username,
                        role: rows[0].staff_role,
                        staff_id: rows[0].staff_id,
                        employment_type: rows[0].employment_type,

                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '10h' }
                );

                const response = {
                    token: `Bearer ${token}`,
                    user: {
                        username: rows[0].username,
                        role: rows[0].staff_role,
                        staff_id: rows[0].staff_id,
                        employment_type: rows[0].employment_type,
                    }

                };
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Authentication passed.', response));
            } else {
                res.status(HttpStatus.NOT_FOUND.code)
                    .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Password is invalid.`));
            }
        }

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }
};

const checkEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Email missing.`));
    }
    logger.info(`${req.method} ${req.originalUrl}, Checking email : ${email}`);


    try {
        const [results] = await pool.execute(STAFF_QUERY.SELECT_STAFF_BY_EMAIL, [email]);

        if (!results[0]) {
            console.log("results[0]=", results[0])
            res.status(HttpStatus.NOT_FOUND.code)
                .send(new Response(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `Email is not exist.`));
        } else {
            const code = generateCode();
            codeStore.set(email, { code, expireAt: Date.now() + 300000 });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'changtalin8626@gmail.com',
                    pass: 'sbzpzihrxovsknwx',
                },
            });
            try {

                const mailOptions = {
                    from: 'changtalin8626@gmail.com',
                    to: email,
                    subject: 'Your Password Reset Code',
                    text: `Your verification code is: ${code}`
                };
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });

                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));
            } catch (error) {

                console.error('Error sending code:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Internal server error'));
            }


        }

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }
};


const verifyCode = async (req, res) => {

    const { email, code } = req.body;

    if (!code) {
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Code missing'));
    }
    logger.info(`${req.method} ${req.originalUrl}, Verifying code : ${code} for email: ${email}`);
    const storedCodeData = codeStore.get(email);
    if (!storedCodeData) {
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Code expired or not found'));
    }

    if (Date.now() > storedCodeData.expireAt) {
        codeStore.delete(email);
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Code expired'));
    }


    if (storedCodeData.code === code) {

        const token = jwt.sign(
            {
                email: email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const response = {
            token: `Bearer ${token}`,
        };

        return res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status, 'Authentication passed.', response));
    } else {
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, 'Invalid code'));
    }

};

const resendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, `Email missing.`));
    }
    logger.info(`${req.method} ${req.originalUrl}, Resend code for email : ${email}`);
    const code = generateCode();
    codeStore.set(email, { code, expireAt: Date.now() + 300000 });
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'changtalin8626@gmail.com',
            pass: 'sbzpzihrxovsknwx',
        },
    });
    try {

        const mailOptions = {
            from: 'changtalin8626@gmail.com',
            to: email,
            subject: 'Your Password Reset Code',
            text: `Your verification code is: ${code}`
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));
    } catch (error) {

        console.error('Error sending code:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
            .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, 'Internal server error'));
    }
};

const updatePassword = async (req, res) => {
    const { email, password } = req.body;
    logger.info(`pass=${password}`)
    try {
        const password_hash = await generateBcryptHash(password);
        const [result] = await pool.execute(STAFF_QUERY.UPDATE_STAFF_PASSWORD_BY_EMAIL, [password_hash, email]);
        console.log('Update Result:', result);
        res.status(HttpStatus.OK.code).send(new Response(HttpStatus.OK.code, HttpStatus.OK.status));

    } catch (err) {
        console.error('Error executing query:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.code, 'Database query failed.'));
    }

};

module.exports = { authLogin, checkEmail, verifyCode, resendCode, updatePassword };
