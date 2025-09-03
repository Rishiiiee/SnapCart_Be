const User = require("../models/usermodel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.test = (req, res) => {
    res.status(200).json({ message: "Test route is working!" });
}

module.exports.Register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    try {
        const isexistuser = await User.findOne({ email: req.body.email });
        if (isexistuser) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        if (!hashedPassword) {
            return res.status(500).json({ message: "Error hashing password!" });
        }
        let role = "user";
        if (req.body.email === process.env.ADMIN_EMAIL) {
            role = "admin";
        }

        await User.create({
            ...req.body,
            password: hashedPassword,
            role
        });
        return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error during registration:", error.message);
        return res.status(500).json({ message: error.message });
    }
}

module.exports.Login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Fill all the fields" });
  }
  try {
    const isexistuser = await User.findOne({ email: req.body.email });
    if (!isexistuser) {
      return res.status(400).json({ message: "User not exist" });
    }

    const convertpassword = await bcrypt.compare(req.body.password, isexistuser.password);
    if (!convertpassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: isexistuser._id, role: isexistuser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Proper cookie setup
    res.cookie("AccessToken", token, {
      httpOnly: true,
      secure: false,      // keep false in dev, set true in production with https
      sameSite: "lax",    // "none" if frontend runs on different domain
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: isexistuser._id, name: isexistuser.name, email: isexistuser.email, role: isexistuser.role }
    });
  } catch (error) {
    console.error(error, "error while login");
    res.status(500).json({ message: error.message });
  }
};



module.exports.Logout = async (req, res) => {
  try {
    res.clearCookie("AccessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).json({ message: error.message });
  }
};


module.exports.getuser = async (req, res) => {
    res.status(200).json(req.user);
}
