import { v2 as cloudinary } from "cloudinary";
import AppError from "../utils/AppError.js"; // your path

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadReceipt = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "receipts", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new AppError("Could not upload the receipt image", 502));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};