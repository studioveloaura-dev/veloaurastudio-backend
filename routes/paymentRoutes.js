const express = require("express");
const router  = express.Router();
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/auth"); 

// POST /api/payment/create-order  → create Razorpay order
router.post("/create-order", verifyToken, createOrder);

// POST /api/payment/verify        → verify after payment
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;