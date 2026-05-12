const express = require("express");
const router  = express.Router();
const { adminLogin } = require("../controllers/adminController");
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getStats,
  deleteOrder,
} = require("../controllers/adminController");


router.post("/login", adminLogin);

// GET  /api/admin/orders       
router.get("/orders",           getAllOrders);

// GET  /api/admin/orders/:id    
router.get("/orders/:id",       getOrderById);

// PUT  /api/admin/orders/:id    
router.put("/orders/:id",       updateOrderStatus);

// GET  /api/admin/stats         
router.get("/stats",            getStats);

// DELETE /api/admin/orders/:id  
router.delete("/orders/:id",    deleteOrder);

module.exports = router;