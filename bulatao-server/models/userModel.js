const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true, // admins deactivate an account instead of deleting it
    },
    contactNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    profileImage: { type: String, default: "" },
    // Internal login protection state; hidden from normal User queries/responses.
    failedLoginAttempts: { type: Number, default: 0, select: false },
    loginLockUntil: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

// Hash the password whenever it's set or changed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
