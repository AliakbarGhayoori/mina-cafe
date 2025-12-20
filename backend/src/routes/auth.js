const express = require("express");
const jwt = require("jsonwebtoken");
const { Admin, User } = require("../models");
const { sendOtp } = require("../services/kavenegar");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// Admin register (for initial setup; you can remove/secure later)
router.post("/admin/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const admin = await Admin.create({ email, password, name });
    return res.status(201).json({ id: admin.id, email: admin.email });
  } catch (err) {
    return next(err);
  }
});

// Admin login
router.post("/admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    return next(err);
  }
});

// Admin verify token
router.get("/admin/verify", adminAuth, async (req, res) => {
  return res.json({
    valid: true,
    admin: req.admin,
  });
});

// User send OTP
router.post("/user/send-otp", async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: "Mobile is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile, otpCode: code, otpExpires: expires });
    } else {
      user.otpCode = code;
      user.otpExpires = expires;
      await user.save();
    }

    await sendOtp(mobile, code);

    return res.json({ message: "OTP sent" });
  } catch (err) {
    return next(err);
  }
});

// User verify OTP
router.post("/user/verify-otp", async (req, res, next) => {
  try {
    const { mobile, code } = req.body;
    if (!mobile || !code) {
      return res.status(400).json({ message: "Mobile and code are required" });
    }

    const user = await User.findOne({ mobile });
    if (
      !user ||
      !user.otpCode ||
      user.otpCode !== code ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // For website users we can issue a simple token (or just confirm login).
    const token = jwt.sign(
      { sub: user.id, mobile: user.mobile, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user: { id: user.id, mobile: user.mobile } });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
