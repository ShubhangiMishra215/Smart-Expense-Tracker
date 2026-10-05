import express from "express";
import { deleteBudget, getBudget, setBudget } from "../controllers/budgetController.js";
import { authenticate } from "../middleware/auth.js";

const budgetRouter = express.Router();
budgetRouter.use(authenticate);

budgetRouter.post("/",setBudget);
budgetRouter.get("/",getBudget);
budgetRouter.delete("/:category",deleteBudget)

export default budgetRouter