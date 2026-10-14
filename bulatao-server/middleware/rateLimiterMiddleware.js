const rateLimit = require("express-rate-limit");

// Login, registration, and password changes are sensitive or abuse-prone actions.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Keep the IP-wide backstop above the 10-attempt account lockout sequence,
  // so it does not mask the escalating per-account lock durations.
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registration attempts. Please try again later." },
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many password change attempts. Please try again later." },
});

// Backstops for authenticated write endpoints. Tune these with real traffic and
// use a shared store (for example Redis) when running multiple server instances.
const catalogWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many catalog changes. Please try again later." },
});
const cartWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many cart changes. Please try again later." },
});
const orderWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many order attempts. Please try again later." },
});
const reviewWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many review changes. Please try again later." },
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordChangeLimiter,
  catalogWriteLimiter,
  cartWriteLimiter,
  orderWriteLimiter,
  reviewWriteLimiter,
};
