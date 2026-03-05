const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ===========================
// GET ALL ORDERS
// ===========================
router.get("/orders", async (req, res) => {

    try {

        const orders = await Order.find().sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server Error" });

    }

});


// ===========================
// UPDATE ORDER STATUS
// ===========================
router.put("/orders/:id", async (req, res) => {

    try {

        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(order);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Update Failed" });

    }

});

module.exports = router;