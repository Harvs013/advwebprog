const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isEmail = (value) => isNonEmptyString(value) && /^\S+@\S+\.\S+$/.test(value.trim());

const validate = (checks) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      errors: [{ location: "body", msg: "Request body must be a JSON object", path: "body" }],
    });
  }

  const errors = checks(req.body, req);
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
};

const makeError = (path, msg, value) => ({ type: "field", value, msg, path, location: "body" });

// Validates the fields accepted by POST /api/users based on UserModel.
// Public signup permits buyer and seller roles; admin accounts are not self-registered.
const registerValidation = validate((body) => {
  const errors = [];
  for (const field of ["firstName", "lastName"]) {
    if (!isNonEmptyString(body[field])) errors.push(makeError(field, `${field} must be a non-empty string`, body[field]));
  }
  if (!isEmail(body.email)) errors.push(makeError("email", "Invalid email address", body.email));
  if (typeof body.password !== "string" || body.password.length < 6) {
    errors.push(makeError("password", "Password must be a string with at least 6 characters", body.password));
  }
  if (body.role !== undefined && !["buyer", "seller"].includes(body.role)) {
    errors.push(makeError("role", "Role must be buyer or seller", body.role));
  }
  for (const field of ["contactNumber", "address", "profileImage"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      errors.push(makeError(field, `${field} must be a string`, body[field]));
    }
  }
  return errors;
});

const loginValidation = validate((body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push(makeError("email", "Invalid email address", body.email));
  if (!isNonEmptyString(body.password)) errors.push(makeError("password", "Password is required", body.password));
  return errors;
});

const profileUpdateValidation = validate((body) => {
  const errors = [];
  const allowedFields = ["firstName", "lastName", "email", "contactNumber", "address", "profileImage"];
  const suppliedFields = Object.keys(body).filter((field) => body[field] !== undefined);
  if (suppliedFields.length === 0) errors.push(makeError("body", "Provide at least one profile field to update", body));
  for (const field of suppliedFields) {
    if (!allowedFields.includes(field)) {
      errors.push(makeError(field, `${field} cannot be updated through this route`, body[field]));
    } else if (!isNonEmptyString(body[field])) {
      errors.push(makeError(field, `${field} must be a non-empty string`, body[field]));
    } else if (field === "email" && !isEmail(body.email)) {
      errors.push(makeError(field, "Invalid email address", body[field]));
    }
  }
  return errors;
});

const passwordChangeValidation = validate((body) => {
  const errors = [];
  if (!isNonEmptyString(body.currentPassword)) {
    errors.push(makeError("currentPassword", "Current password is required", body.currentPassword));
  }
  if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
    errors.push(makeError("newPassword", "New password must be at least 6 characters", body.newPassword));
  }
  return errors;
});

const userStatusValidation = validate((body) => {
  return typeof body.isActive === "boolean"
    ? []
    : [makeError("isActive", "isActive must be a boolean", body.isActive)];
});

const userIdValidation = (req, res, next) => {
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      errors: [makeError("id", "User ID must be a valid MongoDB ObjectId", req.params.id)],
    });
  }
  next();
};

const paramIdValidation = (param) => (req, res, next) => {
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(req.params[param])) {
    return res.status(400).json({
      errors: [makeError(param, `${param} must be a valid MongoDB ObjectId`, req.params[param])],
    });
  }
  next();
};

const bodyValidation = (checks) => validate(checks);
const categoryBodyValidation = bodyValidation((body) => {
  const errors = [];
  if (!isNonEmptyString(body.categoryName)) errors.push(makeError("categoryName", "Category name is required", body.categoryName));
  if (body.description !== undefined && typeof body.description !== "string") errors.push(makeError("description", "Description must be a string", body.description));
  return errors;
});
const productBodyValidation = bodyValidation((body) => {
  const errors = [];
  for (const field of ["productName", "description"]) {
    if (!isNonEmptyString(body[field])) errors.push(makeError(field, `${field} is required`, body[field]));
  }
  if (body.price === undefined || !Number.isFinite(Number(body.price)) || Number(body.price) < 0) errors.push(makeError("price", "Price must be a non-negative number", body.price));
  if (body.quantity !== undefined && (!Number.isFinite(Number(body.quantity)) || Number(body.quantity) < 0)) errors.push(makeError("quantity", "Quantity must be a non-negative number", body.quantity));
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(body.category)) errors.push(makeError("category", "Category must be a valid MongoDB ObjectId", body.category));
  if (body.condition !== undefined && !["new", "used"].includes(body.condition)) errors.push(makeError("condition", "Condition must be new or used", body.condition));
  if (body.status !== undefined && !["available", "sold", "out of stock"].includes(body.status)) errors.push(makeError("status", "Invalid product status", body.status));
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.some((image) => typeof image !== "string"))) errors.push(makeError("images", "Images must be an array of strings", body.images));
  return errors;
});
const productUpdateValidation = bodyValidation((body, req) => {
  const errors = [];
  const allowed = ["productName", "description", "price", "category", "images", "quantity", "condition", "status", "seller"];
  if (!Object.keys(body).length && !req.file) errors.push(makeError("body", "Provide at least one product field to update", body));
  for (const key of Object.keys(body)) if (!allowed.includes(key)) errors.push(makeError(key, `${key} cannot be updated here`, body[key]));
  for (const field of ["productName", "description"]) if (body[field] !== undefined && !isNonEmptyString(body[field])) errors.push(makeError(field, `${field} must be a non-empty string`, body[field]));
  for (const field of ["price", "quantity"]) if (body[field] !== undefined && (!Number.isFinite(Number(body[field])) || Number(body[field]) < 0)) errors.push(makeError(field, `${field} must be a non-negative number`, body[field]));
  const mongoose = require("mongoose");
  if (body.category !== undefined && !mongoose.isValidObjectId(body.category)) errors.push(makeError("category", "Category must be a valid MongoDB ObjectId", body.category));
  if (body.seller !== undefined && !mongoose.isValidObjectId(body.seller)) errors.push(makeError("seller", "Seller must be a valid MongoDB ObjectId", body.seller));
  if (body.condition !== undefined && !["new", "used"].includes(body.condition)) errors.push(makeError("condition", "Condition must be new or used", body.condition));
  if (body.status !== undefined && !["available", "sold", "out of stock"].includes(body.status)) errors.push(makeError("status", "Invalid product status", body.status));
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.some((image) => typeof image !== "string"))) errors.push(makeError("images", "Images must be an array of strings", body.images));
  return errors;
});
const cartItemValidation = bodyValidation((body) => {
  const errors = [];
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(body.productId)) errors.push(makeError("productId", "Product ID must be a valid MongoDB ObjectId", body.productId));
  if (!Number.isInteger(body.quantity) || body.quantity < 1) errors.push(makeError("quantity", "Quantity must be a positive integer", body.quantity));
  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0) errors.push(makeError("price", "Price must be a non-negative number", body.price));
  return errors;
});
const orderBodyValidation = bodyValidation((body) => {
  const errors = [];
  const allowedFields = ["items", "totalAmount", "shippingAddress", "paymentMethod"];
  for (const key of Object.keys(body)) if (!allowedFields.includes(key)) errors.push(makeError(key, `${key} cannot be set when creating an order`, body[key]));
  const methods = ["cod", "credit_card", "gcash", "paypal"];
  if (!isNonEmptyString(body.shippingAddress)) errors.push(makeError("shippingAddress", "Shipping address is required", body.shippingAddress));
  if (!methods.includes(body.paymentMethod)) errors.push(makeError("paymentMethod", "Invalid payment method", body.paymentMethod));
  if (!Number.isFinite(Number(body.totalAmount)) || Number(body.totalAmount) < 0) errors.push(makeError("totalAmount", "Total amount must be a non-negative number", body.totalAmount));
  if (!Array.isArray(body.items) || body.items.length === 0) errors.push(makeError("items", "At least one order item is required", body.items));
  else body.items.forEach((item, index) => {
    const mongoose = require("mongoose");
    if (!mongoose.isValidObjectId(item.product)) errors.push(makeError(`items.${index}.product`, "Product ID must be valid", item.product));
    if (!Number.isInteger(item.quantity) || item.quantity < 1) errors.push(makeError(`items.${index}.quantity`, "Quantity must be a positive integer", item.quantity));
    if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) errors.push(makeError(`items.${index}.price`, "Price must be a non-negative number", item.price));
  });
  return errors;
});
const productQueryValidation = (req, res, next) => {
  const errors = [];
  const { status, seller, category, search, page, limit, sort } = req.query;
  if (status !== undefined && !["available", "sold", "out of stock"].includes(status)) errors.push({ location: "query", path: "status", msg: "Invalid product status" });
  const mongoose = require("mongoose");
  if (seller !== undefined && !mongoose.isValidObjectId(seller)) errors.push({ location: "query", path: "seller", msg: "Seller must be a valid MongoDB ObjectId" });
  if (category !== undefined && (!isNonEmptyString(category) || category.length > 100)) errors.push({ location: "query", path: "category", msg: "Category must be 1 to 100 characters" });
  if (search !== undefined && (typeof search !== "string" || search.length > 100)) errors.push({ location: "query", path: "search", msg: "Search must be at most 100 characters" });
  for (const [name, value, max] of [["page", page, 100000], ["limit", limit, 100]]) {
    if (value !== undefined && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max)) errors.push({ location: "query", path: name, msg: `${name} must be between 1 and ${max}` });
  }
  if (sort !== undefined && !["price", "-price", "productName", "-productName", "quantity", "-quantity", "createdAt", "-createdAt"].includes(sort)) errors.push({ location: "query", path: "sort", msg: "Invalid sort field" });
  if (errors.length) return res.status(400).json({ errors });
  next();
};
const orderStatusValidation = bodyValidation((body) => {
  const errors = [];
  if (!body.orderStatus && !body.paymentStatus) errors.push(makeError("body", "Provide an order or payment status", body));
  if (body.orderStatus !== undefined && !["pending", "confirmed", "ready_for_pickup", "completed", "cancelled"].includes(body.orderStatus)) errors.push(makeError("orderStatus", "Invalid order status", body.orderStatus));
  if (body.paymentStatus !== undefined && !["pending", "paid", "failed", "refunded"].includes(body.paymentStatus)) errors.push(makeError("paymentStatus", "Invalid payment status", body.paymentStatus));
  return errors;
});
const reviewBodyValidation = bodyValidation((body) => {
  const errors = [];
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(body.product)) errors.push(makeError("product", "Product ID must be valid", body.product));
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) errors.push(makeError("rating", "Rating must be an integer from 1 to 5", body.rating));
  if (body.comment !== undefined && typeof body.comment !== "string") errors.push(makeError("comment", "Comment must be a string", body.comment));
  return errors;
});
const reviewUpdateValidation = bodyValidation((body) => {
  const errors = [];
  const keys = Object.keys(body);
  if (!keys.length) errors.push(makeError("body", "Provide a rating or comment", body));
  for (const key of keys) {
    if (!["rating", "comment"].includes(key)) errors.push(makeError(key, `${key} cannot be updated here`, body[key]));
    if (key === "rating" && (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)) errors.push(makeError(key, "Rating must be an integer from 1 to 5", body[key]));
    if (key === "comment" && typeof body.comment !== "string") errors.push(makeError(key, "Comment must be a string", body[key]));
  }
  return errors;
});

module.exports = {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  passwordChangeValidation,
  userStatusValidation,
  userIdValidation,
  paramIdValidation,
  categoryBodyValidation,
  productBodyValidation,
  productUpdateValidation,
  cartItemValidation,
  orderBodyValidation,
  orderStatusValidation,
  reviewBodyValidation,
  reviewUpdateValidation,
  productQueryValidation,
};
