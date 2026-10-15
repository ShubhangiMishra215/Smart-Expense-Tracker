import {
  addRecurringExpense,
  fetchRecurringExpense,
  removeRecurringExpense,
} from "../services/RecurringExpenseService.js";

export const createRecurringExpense = async (req, res, next) => {
  try {
    const recurringExpense = await addRecurringExpense(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Recurring expense created successfully",
      recurringExpense,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecurringExpenses = async (req, res, next) => {
  try {
    const recurringExpenses = await fetchRecurringExpense(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Recurring expenses fetched successfully",
      recurringExpenses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurringExpense = async (req, res, next) => {
  try {
    const expense = await removeRecurringExpense(req.user.id, req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "No such expense found",
      });
    }
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};
