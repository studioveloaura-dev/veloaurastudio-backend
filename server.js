const express    = require("express");
const cors       = require("cors");
const dotenv     = require("dotenv");
const connectDB  = require("./config/db");
const helmet     = require("helmet");           
const rateLimit  = require("express-rate-limit");
const { generateGuestToken } = require("./middleware/auth");

// Load .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(helmet());

// Rate Limiting — max 100 requests per 15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  "Too many requests, please try again later",
});
app.use(limiter);

// Payment routes strict limit — 10 per 15 min
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  "Too many payment attempts",
});

// ─── MIDDLEWARE ────────────────────────────────────────
app.use(cors({
  // origin: "http://localhost:5173", 
  origin: [
    "https://veloaurastudio.com",
    "https://www.veloaurastudio.com",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // allows reading JSON from requests

// ─── ROUTES ────────────────────────────────────────────
app.use("/api/cart",    require("./routes/cartRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.get("/api/auth/guest-token", generateGuestToken);


//admin routes
app.use("/api/admin", require("./routes/adminRoutes"));



// Visit http://localhost:5000 to check if server is running
app.get("/", (req, res) => {
  res.send("🚀 Lamp Shop Backend is Running!");
});

// ─── START SERVER ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});