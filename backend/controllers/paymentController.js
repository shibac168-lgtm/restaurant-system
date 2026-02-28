const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =============================
// CREATE ORDER
// =============================
exports.createOrder = async (req, res) => {
    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100, // paisa
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Order creation failed" });
    }
};


// =============================
// VERIFY PAYMENT
// =============================
exports.verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cart,
            totalAmount
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            // Save Order in DB
            const newOrder = new Order({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                items: cart,
                totalAmount
            });

            await newOrder.save();

            res.json({ success: true });

        } else {
            res.status(400).json({ success: false });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
};