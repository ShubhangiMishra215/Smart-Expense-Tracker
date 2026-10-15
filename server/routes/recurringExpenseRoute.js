import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createRecurringExpense, deleteRecurringExpense, getRecurringExpenses } from "../controllers/RecurringExpenseController.js";

const recurringRouter = express.Router();
recurringRouter.use(authenticate);

recurringRouter.post("/",createRecurringExpense);
recurringRouter.get("/", getRecurringExpenses);
recurringRouter.delete("/:id",deleteRecurringExpense)

export default recurringRouter;
