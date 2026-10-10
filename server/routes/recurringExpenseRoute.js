import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createRecurringExpense } from "../controllers/RecurringExpenseController.js";

const recurringRouter = express.Router();
recurringRouter.use(authenticate);

recurringRouter.post("/",createRecurringExpense);

export default recurringRouter;
