import CategoryRule from "../models/CategoryRule.js";
import Expense from "../models/Expense.js";
import { dateFilters } from "../utils/dateFilters.js";

export const addExpense = async (userId, expenseData) => {
  const { amount, category, description, date, receiptUrl } = expenseData;

  const newExpense = new Expense({
    user: userId,
    amount,
    category,
    description,
    date,
    receiptUrl,
  });
  const expense = await newExpense.save();
  return expense;
};

// services/expenseServices.js
export const fetchExpenses = async (userId, filterData) => {
  const { filter, startDate, endDate } = filterData;

  const page = Math.max(parseInt(filterData.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filterData.limit) || 10, 1), 50);

  const query = { user: userId };

  if (filter) {
    const { startDate: computedStart, endDate: computedEnd } = dateFilters({
      filter,
      startDate,
      endDate,
    });
    query.date = { $gte: computedStart, $lte: computedEnd };
  }

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort({ date: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Expense.countDocuments(query),
  ]);

  return {
    expenses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const fetchExpenseById = async (expenseId, userId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  return expense;
};

export const changeExpense = async (expenseId, userId, expenseData) => {
  const { amount, category, description, date } = expenseData;

  const existing = await fetchExpenseById(expenseId, userId);
  if (!existing) return null;

  const oldCategory = existing.category;

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

  if (category && category != oldCategory) {
    if (expense.description) {
      const keyword = expense.description.toLowerCase().trim();
      if (keyword) {
        await CategoryRule.findOneAndUpdate(
          { user: userId, keyword },
          { category },
          { upsert: true, new: true, runValidators: true },
        );
      }
    }
  }
  return expense;
};

export const removeExpense = async (expenseId, userId) => {
  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });
  return expense;
};
