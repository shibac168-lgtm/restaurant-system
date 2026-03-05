const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


// ==============================
// GET ALL ORDERS (ADMIN PANEL)
// ==============================
router.get("/orders", async (req, res) => {
    try {

        const orders = await Order.find()
        .sort({ createdAt: -1 }); // latest order first

        res.json({
            success: true,
            total: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("Fetch Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ==============================
// GET SINGLE ORDER
// ==============================
router.get("/orders/:id", async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order: order
        });

    } catch (error) {

        console.error("Single Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

});


// ==============================
// UPDATE ORDER STATUS
// ==============================
router.put("/orders/:id", async (req, res) => {

    try {

        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated",
            order: order
        });

    } catch (error) {

        console.error("Update Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Update Failed"
        });
    }

});


// ==============================
// DELETE ORDER (OPTIONAL)
// ==============================
router.delete("/orders/:id", async (req, res) => {

    try {

        await Order.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Order deleted"
        });

    } catch (error) {

        console.error("Delete Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Delete Failed"
        });
    }

});


module.exports = router;