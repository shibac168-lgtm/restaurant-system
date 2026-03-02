// =============================
// VERIFY PAYMENT
// =============================
exports.verifyPayment = async (req, res) => {

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

            // ✅ Custom Order ID Generate
            const customOrderId = "ORD" + Date.now();

            // ✅ Save Order in MongoDB
            const newOrder = new Order({
                orderId: customOrderId,
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
                statusHistory: [{ status: "Paid" }]
            });

            await newOrder.save();

            res.json({
                success: true,
                orderId: customOrderId
            });

        } else {
            res.status(400).json({ success: false });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
};