const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();
const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Choose a JPEG, PNG, or WebP image.");
      error.code = "INVALID_IMAGE_TYPE";
      cb(error);
    }
  },
});

const single = (fieldName) => {
  const parseFile = upload.single(fieldName);

  return (req, res, next) => {
    parseFile(req, res, async (error) => {
      if (error) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : error.code === "INVALID_IMAGE_TYPE" ? 415 : 400;
        const message = error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller."
          : error.message;
        return res.status(status).json({ success: false, message });
      }

      if (!req.file) return next();

      try {
        const expectedFormat = allowedTypes.get(req.file.mimetype);
        const image = sharp(req.file.buffer, { limitInputPixels: 25000000 });
        const metadata = await image.metadata();

        if (metadata.format !== expectedFormat || !metadata.width || !metadata.height) {
          return res.status(415).json({
            success: false,
            message: "The selected file is not a valid JPEG, PNG, or WebP image.",
          });
        }

        await image.stats();
        next();
      } catch {
        res.status(415).json({
          success: false,
          message: "The selected file is not a valid JPEG, PNG, or WebP image.",
        });
      }
    });
  };
};

module.exports = { single };
