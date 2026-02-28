const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    items: Array,
    totalAmount: Number,
    status: {
        type: String,
        default: "Paid"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);