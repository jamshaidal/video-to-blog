const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  signupController,
  loginController,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", asyncHandler(signupController));
router.post("/login", asyncHandler(loginController));

module.exports = router;
