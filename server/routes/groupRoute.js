import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createGroupController } from "../controllers/groupController.js";

const groupRouter = express.Router();
groupRouter.use(authenticate);

groupRouter.post("/",createGroupController);

export default groupRouter;
