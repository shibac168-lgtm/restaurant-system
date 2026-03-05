require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/admin");   // ✅ ADD

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// MONGODB CONNECTION
// =======================
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
});

// =======================
// ROUTES
// =======================
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);   // ✅ ADD

// Test Route
app.get("/", (req, res) => {
    res.send("Kasturi Restaurant Backend Running 🚀");
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});