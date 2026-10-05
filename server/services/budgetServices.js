import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import AppError from "../utils/AppError.js";
import { getBudgetStatus } from "../utils/budgetStatus.js";

export const upsertBudget = async (userId, budgetData) => {
  const category = budgetData.category;
  const limit = budgetData.limit;
  if (!category || !limit) {
    throw new AppError("Missing fields", 400);
  }
  const budget = await Budget.findOneAndUpdate(
    {
      user: userId,
      category,
    },
    { limit },
    { upsert: true, new: true, runValidators: true },
  );

  return budget;
};

export const fetchBudgets = async (userId) => {
  const budgets = await Budget.find({ user: userId });
  return budgets;
};

export const removeBudget = async (userId, budgetData) => {
  const category = budgetData.category;
  if (!category) {
    throw new AppError("Missing fields", 400);
  }
  const budget = await Budget.findOneAndDelete({
    user: userId,
    category,
  });
  return budget;
};

export const getMonthlyExpense = async (userId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1);
  const nextStart = new Date(year, month + 1, 1);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const spendByCategory = await Expense.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: startDate, $lt: nextStart },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);
  const spendByCategoryMap = new Map();
  spendByCategory.forEach((element) => {
    spendByCategoryMap.set(element._id, element.total);
  });

  return spendByCategoryMap;
};

export const getBudgetStatuses = async (userId) => {
  const budgets = await fetchBudgets(userId);
  const spendMap = await getMonthlyExpense(userId);

  return budgets.map((element) => {
    const spent = spendMap.get(element.category) ?? 0;
    const percent = (spent / element.limit) * 100;
    const percentUsed = Math.round(percent * 100) / 100;
    const status = getBudgetStatus(percent);

    return {
      category: element.category,
      limit: element.limit,
      spent,
      percentUsed,
      status,
    };
  });
};
