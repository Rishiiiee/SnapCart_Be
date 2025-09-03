const express = require("express");
const { CreateOrder, verifyPayment, getUserOrders } = require("../controller/orderController");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/razorpay/create", authMiddleware, CreateOrder);
router.post("/razorpay/verify", verifyPayment);
router.get("/my-orders", authMiddleware, getUserOrders);

module.exports = router;
