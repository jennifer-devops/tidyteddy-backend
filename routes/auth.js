const express = require("express");
const {
  authLogin,
  checkEmail,
  verifyCode,
  resendCode,
  updatePassword,
} = require("../src/controller/auth.controller.js");
const { authenticateToken } = require("../src/middleware/authMiddleware.js");

const authRoutes = express.Router();

authRoutes.route("/login").post(authLogin);
authRoutes.route("/check-email").post(checkEmail);
authRoutes.route("/verify-code").post(verifyCode);
authRoutes.route("/resend-code").post(resendCode);
authRoutes.route("/update-password").post(authenticateToken, updatePassword);

module.exports = authRoutes;
