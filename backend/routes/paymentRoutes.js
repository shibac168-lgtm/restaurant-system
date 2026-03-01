const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ===============================
// Generate Professional Order ID
// ===============================
function generateOrderId() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `KST-${date}-${random}`;
}

// ===============================
// CREATE ORDER
// ===============================
router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // convert to paise
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// VERIFY PAYMENT + SAVE ORDER
// ===============================
router.post("/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            totalAmount
        } = req.body;

        // Create signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Verify signature
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Generate Professional Order ID
        const customOrderId = generateOrderId();

        // Save to MongoDB
        const newOrder = new Order({
            orderId: customOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            totalAmount,
            status: "Paid"
        });

        await newOrder.save();

        res.json({
            success: true,
            orderId: customOrderId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// TRACK ORDER (Custom Order ID)
// ===============================
router.get("/track/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            orderId: order.orderId,
            status: order.status,
            amount: order.totalAmount,
            createdAt: order.createdAt
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;