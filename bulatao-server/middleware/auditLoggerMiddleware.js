const Log = require("../models/logModel");

const logger = {
  info: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "info", message, metadata });
    } catch (error) {
      console.error("Failed to write info log:", error.message);
    }
  },

  warn: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "warn", message, metadata });
    } catch (error) {
      console.error("Failed to write warn log:", error.message);
    }
  },

  error: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "error", message, metadata });
    } catch (error) {
      console.error("Failed to write error log:", error.message);
    }
  },
};

// Log each completed request after authentication middleware has populated req.user.
const auditLoggerMiddleware = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const user = req.user;
    const userId = user?._id?.toString() || user?.id || user?.userID || null;
    const username =
      user?.username || user?.email ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
    const statusCode = res.statusCode;
    const logData = {
      method: req.method,
      path: req.originalUrl || req.path,
      ip: req.ip || req.socket?.remoteAddress || null,
      userId,
      username,
      statusCode,
      metadata: { duration: `${Date.now() - startedAt}ms` },
    };
    const message = `${logData.method} ${logData.path} - ${statusCode}`;

    const writeLog = statusCode >= 500 ? logger.error : statusCode >= 400 ? logger.warn : logger.info;
    void writeLog(message, logData);
  });

  next();
};

module.exports = { logger, auditLoggerMiddleware };
