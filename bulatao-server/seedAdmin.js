// Run once with: node seedAdmin.js
// Creates (or promotes) an admin account. There's no admin registration
// route on purpose (matches the exam spec: admins only get Login), so this
// is how you provision the one admin account you'll demo with.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/userModel");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@bulldogex.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

(async () => {
  await connectDB();

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    admin.role = "admin";
    admin.isActive = true;
    await admin.save();
    console.log(`Existing user ${ADMIN_EMAIL} promoted to admin.`);
  } else {
    admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  process.exit(0);
})();