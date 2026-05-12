const Cart = require("../models/Cart");

//GET CART 
// Called when: user opens cart page
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    
    if (!cart) {
      // No cart yet = return empty cart
      return res.json({ userId: req.params.userId, items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD TO CART 
// Called when: user clicks "Add to Cart" button
exports.addToCart = async (req, res) => {
  try {
    const { userId, product } = req.body;
    // req.body = data sent from frontend
    // product = { productId, name, price, image }

    // Find existing cart OR create new one
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.productId === product.productId
    );

    if (existingItem) {
      // Already in cart n increase quantity
      existingItem.quantity += 1;
    } else {
      // Not in cart , add it
      cart.items.push({ ...product, quantity: 1 });
    }

    await cart.save(); // Save to MongoDB
    res.json(cart);    // Send updated cart back to frontend
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  REMOVE FROM CART 
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the removed product
    cart.items = cart.items.filter(
      item => item.productId !== productId
    );

    await cart.save();
    res.json(cart);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE QUANTITY 
exports.updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    const item = cart.items.find(i => i.productId === productId);

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        // Remove item if quantity goes to 0
        cart.items = cart.items.filter(i => i.productId !== productId);
      }
    }

    await cart.save();
    res.json(cart);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  CLEAR CART 
// Called after successful payment
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared", items: [] });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};