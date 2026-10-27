import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createGroupController, createGroupExpenseController } from "../controllers/groupController.js";

const groupRouter = express.Router();
groupRouter.use(authenticate);

groupRouter.post("/",createGroupController);
groupRouter.post("/:id/expenses",createGroupExpenseController);

export default groupRouter;
