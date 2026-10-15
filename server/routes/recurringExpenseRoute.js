import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createRecurringExpense, deleteRecurringExpense, getRecurringExpenses, pauseRecurringExpense, resumeRecurringExpense } from "../controllers/RecurringExpenseController.js";

const recurringRouter = express.Router();
recurringRouter.use(authenticate);

recurringRouter.post("/",createRecurringExpense);
recurringRouter.get("/", getRecurringExpenses);
recurringRouter.delete("/:id",deleteRecurringExpense)
recurringRouter.patch("/:id/pause",pauseRecurringExpense);
recurringRouter.patch("/:id/resume",resumeRecurringExpense)

export default recurringRouter;
