const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },

    // Razorpay Details
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    // Order Details
    items: [
        {
            name: String,
            price: Number
        }
    ],

    totalAmount: Number,

    // 👇 NEW FIELDS (Customer Info)
    customerName: String,
    phoneNumber: String,
    tableOrAddress: String,
    instructions: String,

    // Order Status
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