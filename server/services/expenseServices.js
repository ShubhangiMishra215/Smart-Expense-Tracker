import Expense from "../models/Expense.js";
import { dateFilters } from "../utils/dateFilters.js";

export const addExpense = async (userId, expenseData) => {
  const { amount, category, description, date } = expenseData;

  const newExpense = new Expense({
    user: userId,
    amount,
    category,
    description,
    date,
  });
  const expense = await newExpense.save();
  return expense;
};

export const fetchExpenses = async (userId, filterData) => {
  const { filter, startDate, endDate } = filterData;

  const query = { user: userId };

  if (filter) {
    const { startDate: computedStart, endDate: computedEnd } = dateFilters({
      filter,
      startDate,
      endDate,
    });
    query.date = { $gte: computedStart, $lte: computedEnd };
  }

  const expenses = await Expense.find(query);
  return expenses;
};

export const fetchExpenseById = async (expenseId, userId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  return expense;
};

export const changeExpense = async (expenseId, userId, expenseData) => {
  const { amount, category, description, date } = expenseData;
  const expense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    {
      amount,
      category,
      description,
      date,
    },
    { new: true, runValidators: true },
  );
  return expense;
};

export const removeExpense = async (expenseId, userId) => {
  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });
  return expense;
};
