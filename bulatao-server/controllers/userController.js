const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const ALLOWED_SIGNUP_ROLES = ["buyer", "seller"]; // "admin" can never come from a public signup form

const loginLockMinutes = (failedAttempts) => {
  if (failedAttempts >= 10) return 30;
  if (failedAttempts >= 8) return 5;
  if (failedAttempts >= 5) return 3;
  return 0;
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber, address, role } = req.body;
    const safeRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : "buyer";

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      address,
      role: safeRole,
    });

    const token = generateToken(user);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.failedLoginAttempts;
    delete userWithoutPassword.loginLockUntil;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+failedLoginAttempts +loginLockUntil"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const now = new Date();
    if (user.loginLockUntil && user.loginLockUntil > now) {
      const retryAfterSeconds = Math.ceil((user.loginLockUntil.getTime() - now.getTime()) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: "Account temporarily locked after repeated failed logins",
        retryAfterSeconds,
      });
    }

    // Expiry removes the active lock, but preserves the count so later
    // failures advance to the next lockout threshold.
    if (user.loginLockUntil && user.loginLockUntil <= now) {
      user.loginLockUntil = null;
    }

    if (!(await user.comparePassword(password))) {
      user.failedLoginAttempts += 1;
      const lockMinutes = loginLockMinutes(user.failedLoginAttempts);
      if (lockMinutes > 0) {
        user.loginLockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        await user.save();
        res.set("Retry-After", String(lockMinutes * 60));
        return res.status(429).json({
          message: `Too many failed login attempts. Try again in ${lockMinutes} minutes.`,
          failedAttempts: user.failedLoginAttempts,
          retryAfterSeconds: lockMinutes * 60,
        });
      }

      await user.save();
      return res.status(401).json({
        message: "Invalid email or password",
        failedAttempts: user.failedLoginAttempts,
      });
    }

    user.failedLoginAttempts = 0;
    user.loginLockUntil = null;
    await user.save();

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    const token = generateToken(user);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.failedLoginAttempts;
    delete userWithoutPassword.loginLockUntil;
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role, isActive, and password are deliberately excluded here — role/isActive
// only an admin should change, and password has its own endpoint so it goes
// through the hashing hook correctly.
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, password, ...allowedUpdates } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const matches = await user.comparePassword(currentPassword);
    if (!matches) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword; // pre-save hook re-hashes this
    await user.save();
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin only — activates/deactivates an account instead of deleting it.
exports.setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
