const Order = require("../models/Order");

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    

    // .env  compare 
    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT token 
    const jwt   = require("jsonwebtoken");
    const token = jwt.sign(
      { username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, name: "Admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Valid status check
    const validStatuses = ["pending", "paid", "shipped", "delivered", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // updated order return 
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET STATS
exports.getStats = async (req, res) => {
  try {
    const total     = await Order.countDocuments();
    const paid      = await Order.countDocuments({ status: "paid" });
    const shipped   = await Order.countDocuments({ status: "shipped" });
    const delivered = await Order.countDocuments({ status: "delivered" });
    const failed    = await Order.countDocuments({ status: "failed" });

    // Total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenue = revenueData[0]?.total || 0;

    res.json({ total, paid, shipped, delivered, failed, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};