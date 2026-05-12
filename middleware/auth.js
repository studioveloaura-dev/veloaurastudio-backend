const jwt = require("jsonwebtoken");

// Generate Guest Token
exports.generateGuestToken = (req, res) => {
  try {
    const token = jwt.sign(
      {
        userId:    "guest_user",
        role:      "guest",
        createdAt: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } 
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Token generation failed" });
  }
};

//  Verify Token Middleware
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token check 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId available hoga req mein
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};