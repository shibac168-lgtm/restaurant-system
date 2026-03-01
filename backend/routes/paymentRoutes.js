const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ===============================
// 1️⃣ CREATE ORDER (Razorpay)
// ===============================
router.post("/create-order", async (req, res) => {
    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100, // convert to paisa
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
// 2️⃣ VERIFY PAYMENT & SAVE ORDER
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

        // Create Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Verify
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid Signature" });
        }

        // Professional Custom Order ID
        const customOrderId =
            "ORD-" +
            new Date().getFullYear() +
            "-" +
            Math.floor(100000 + Math.random() * 900000);

        // Save to MongoDB
        const newOrder = new Order({
            orderId: customOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            totalAmount,
            status: "Paid",
            statusHistory: [
                { status: "Paid" }
            ]
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
// 3️⃣ TRACK ORDER
// ===============================
// ===============================
// 3️⃣ TRACK ORDER
// ===============================
router.get("/track/:orderId", async (req, res) => {
    try {

        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            orderId: order.orderId,
            status: order.status,
            amount: order.totalAmount,
            items: order.items,
            history: order.statusHistory
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===============================
// 4️⃣ ADMIN UPDATE STATUS
// ===============================
router.put("/update-status/:orderId", async (req, res) => {
    try {

        const { status } = req.body;

        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;

        order.statusHistory.push({
            status: status,
            time: new Date()
        });

        await order.save();

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;