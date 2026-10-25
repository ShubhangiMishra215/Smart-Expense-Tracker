import express from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadReceiptImage } from "../middleware/upload.js";
import { scanReceiptController } from "../controllers/scanReceiptController.js";

const scanRouter = express.Router();
scanRouter.use(authenticate);

scanRouter.post("/", uploadReceiptImage, scanReceiptController);

export default scanRouter;