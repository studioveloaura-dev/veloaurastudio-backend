const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,      
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,         
  },
  description: {
    type: String,
  },
  category: {
    type: String,         
  },
 
}, { timestamps: true }); // auto adds createdAt and updatedAt

module.exports = mongoose.model("Product", productSchema);