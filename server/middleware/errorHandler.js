import multer from "multer";

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Max size is 5 MB."
        : "File upload error";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}`,
    });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {}).join(", ");
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${fields}`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Something went wrong";
  console.error(err);
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;