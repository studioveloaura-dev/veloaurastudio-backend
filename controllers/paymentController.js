const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Order    = require("../models/Order");
const sendOrderEmail = require("../utils/sendOrderEmail")

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


// CREATE ORDER 
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    //  Amount validate
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    //  Max order limit 
    if (amount > 500000) {
      return res.status(400).json({ message: "Amount exceeds limit" });
    }

    const options = {
      amount:   Math.round(amount * 100), // paise mein
      currency: "INR",
      receipt:  `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      notes: {
        source: "veloaura_website",
      },
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      id:       order.id,
      amount:   order.amount,
      currency: order.currency,
    });

  } catch (error) {
    res.status(500).json({ message: "Could not create order" }); 
  }
};

// VERIFY PAYMENT 
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      items,
      totalAmount,
      address,
    } = req.body;

    //  check all fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !items?.length ||
      !totalAmount ||
      !address
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  address field check
    const { name, phone, email, street, city, state, pincode } = address;
    if (!name || !phone || !email || !street || !city || !state || !pincode) {
      return res.status(400).json({ message: "Incomplete address" });
    }

    //  Signature verify 
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    //  timingSafeEqual (timing attack prevent)
    const sigBuffer      = Buffer.from(razorpay_signature,   "hex");
    const expectedBuffer = Buffer.from(expectedSignature,    "hex");

    const isValid =
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!isValid) {
      console.warn(`⚠️ Invalid payment signature: ${razorpay_payment_id}`);
      return res.status(400).json({ message: "Payment verification failed" });
    }

    //  Duplicate payment check
    const existing = await Order.findOne({ paymentId: razorpay_payment_id });
    if (existing) {
      return res.status(409).json({ message: "Payment already processed" });
    }

    //  SECURITY 6: Razorpay  amount verify 
    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    const actualAmount = rzpOrder.amount / 100; // paise → rupees

    if (Math.round(actualAmount) !== Math.round(totalAmount)) {
      console.warn(`⚠️ Amount mismatch: expected ${actualAmount}, got ${totalAmount}`);
      return res.status(400).json({ message: "Amount mismatch detected" });
    }

    //   checks passed  Save order
    const order = new Order({
      userId:    userId || "guest_user",
      items,
      totalAmount,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      status:    "paid",
       address: {
    name:    address.name,
    phone:   address.phone,
    email:   address.email,   // ← EXPLICITLY SAVE KARO
    street:  address.street,
    city:    address.city,
    state:   address.state,
    pincode: address.pincode,
  },
    });

    await order.save();

   

    await sendOrderEmail(order); // send email after verification

    res.json({
      message:   "Payment verified successfully",
      orderId:   order._id,
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};