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

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Something went wrong";
  console.error(err);
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;