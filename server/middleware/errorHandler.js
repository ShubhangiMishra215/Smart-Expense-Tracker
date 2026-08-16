const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;