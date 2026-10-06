import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import { getWindowBoundaries } from "../utils/getWindowBoundaries.js";

export const getTotalSpend = async (userId, startDate, endDate) => {
    const userObjectId = new mongoose.Types.ObjectId(userId)
  const expense = await Expense.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  return expense[0]?.total ?? 0;
};

export const getWeeklyComparison = async (userId) => {
  const { today, sevenDaysAgo, fourteenDaysAgo } = getWindowBoundaries();
  const currentTotal = await getTotalSpend(userId, sevenDaysAgo, today);
  const previousTotal = await getTotalSpend(userId, fourteenDaysAgo, sevenDaysAgo);

  const difference = currentTotal - previousTotal;
  const percentChange =
    previousTotal === 0
      ? null
      : Math.round((difference / previousTotal) * 100 * 100) / 100;

  return { currentTotal, previousTotal, difference, percentChange };
};