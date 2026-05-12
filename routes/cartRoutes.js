const express = require("express");
const router  = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = require("../controllers/cartController");
const { verifyToken }  = require("../middleware/auth");


// GET  /api/cart/:userId       
router.get("/:userId",    verifyToken, getCart);

// POST /api/cart/add           
router.post("/add",    verifyToken,  addToCart);

// POST /api/cart/remove        
router.post("/remove",    verifyToken, removeFromCart);

// PUT  /api/cart/update        
router.put("/update",    verifyToken,  updateQuantity);

// DELETE /api/cart/clear/:userId
router.delete("/clear/:userId",   verifyToken,  clearCart);

module.exports = router;