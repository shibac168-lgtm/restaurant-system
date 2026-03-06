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

// ==========================
// CREATE ORDER
// ==========================
router.post("/create-order", async (req, res) => {

    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (error) {

        console.log(error);
        res.status(500).json({ error: "Order Creation Failed" });

    }

});

// ==========================
// VERIFY PAYMENT
// ==========================
router.post("/verify-payment", async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            totalAmount,
            customerName,
            phoneNumber,
            tableOrAddress,
            instructions
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            const newOrder = new Order({

                orderId: "ORD" + Date.now(),

                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,

                items,
                totalAmount,

                customerName,
                phoneNumber,
                tableOrAddress,
                instructions,

                status: "Paid",

                statusHistory: [
                    {
                        status: "Paid"
                    }
                ]

            });

            await newOrder.save();

            res.json({
                success: true,
                message: "Payment Verified & Order Saved"
            });

        } else {

            res.status(400).json({
                success: false,
                message: "Invalid Signature"
            });

        }

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Payment Verification Failed"
        });

    }

});

module.exports = router;