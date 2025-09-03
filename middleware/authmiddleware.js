const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.AccessToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access!" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token!" });
        }

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
}

module.exports = authMiddleware;
