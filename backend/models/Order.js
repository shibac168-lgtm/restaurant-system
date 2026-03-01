const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    items: Array,
    totalAmount: Number,

    status: {
        type: String,
        default: "Paid"
    },

    statusHistory: [
        {
            status: String,
            time: {
                type: Date,
                default: Date.now
            }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);