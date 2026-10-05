import express from "express";
import { deleteBudget, getBudget, getStatus, setBudget } from "../controllers/budgetController.js";
import { authenticate } from "../middleware/auth.js";

const budgetRouter = express.Router();
budgetRouter.use(authenticate);

budgetRouter.post("/",setBudget);
budgetRouter.get("/",getBudget);
budgetRouter.get("/status",getStatus);
budgetRouter.delete("/:category",deleteBudget)

export default budgetRouter