import Expense from "../models/Expense.js";
import {
  addExpense,
  changeExpense,
  fetchExpenseById,
  fetchExpenses,
  removeExpense,
} from "../services/expenseServices.js";

export const createExpense = async (req, res, next) => {
  try {
    const expense = await addExpense(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await fetchExpenses(req.user.id, req.query);
    return res.status(200).json({
      success: true,
      message: "Expenses found successfully",
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await fetchExpenseById(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "No such expense found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expenses found successfully",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await changeExpense(req.params.id, req.user.id, req.body);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "No such expense found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expenses updated successfully",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await removeExpense(req.params.id, req.user.id);
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
