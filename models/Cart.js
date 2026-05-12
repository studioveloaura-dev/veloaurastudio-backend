const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  image:     { type: String },
  quantity:  { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    unique: true,       // one cart per user
  },
  items: [cartItemSchema], // array of cart items
  
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);