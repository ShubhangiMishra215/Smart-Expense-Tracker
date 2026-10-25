// middleware/upload.js
import multer from "multer";
import AppError from "../utils/AppError.js"; // your path

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new AppError("Only image files are allowed", 400));
    }
    cb(null, true);
  },
});

export const uploadReceiptImage = upload.single("receipt");