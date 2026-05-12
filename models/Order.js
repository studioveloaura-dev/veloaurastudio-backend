const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  
  items: [
    {
      productId: String,
      name:      String,
      price:     Number,
      quantity:  Number,
      image:     String,
    }
  ],
  
  totalAmount: { type: Number, required: true },
  
  // Payment info from Razorpay
  paymentId:   { type: String },   // razorpay_payment_id
  orderId:     { type: String },   // razorpay_order_id
  
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "shipped", "delivered"],
    default: "pending",
  },
  
  // Delivery address
  address: {
    name:    String,
    phone:   String,
    email:   String,  
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  }
  
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);