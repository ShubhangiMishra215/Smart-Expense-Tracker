import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import { getWindowBoundaries } from "../utils/getWindowBoundaries.js";
import { getMonthlyExpense } from "./budgetServices.js";
import MinHeap from "../utils/MinHeap.js";

export const getTotalSpend = async (userId, startDate, endDate) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
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
  const previousTotal = await getTotalSpend(
    userId,
    fourteenDaysAgo,
    sevenDaysAgo,
  );

  const difference = currentTotal - previousTotal;
  const percentChange =
    previousTotal === 0
      ? null
      : Math.round((difference / previousTotal) * 100 * 100) / 100;

  return { currentTotal, previousTotal, difference, percentChange };
};

export const getExpenseByCategory = async (userId) => {
  const expense = await getMonthlyExpense(userId);
  let total = 0;
  expense.forEach((amount, category) => {
    total += amount;
  });

  const expenseList = Array.from(expense, ([category, amount]) => ({
    category,
    amount,
    percentage: Number(((amount / total) * 100).toFixed(1)),
  }));

  expenseList.sort((a, b) => b.amount - a.amount);
  return {total,breakdown:expenseList};
};

export const getTopK = async(userId,k,startDate,nextStart)=>{
  if(k<=0) return [];
  const expense = await Expense.find(
    {
      
        user:userId,
        date: { $gte: startDate, $lt: nextStart },
    },
    
  )
  const heap = new MinHeap();
  expense.forEach((exp)=>{
    
    if(heap.size()<k){
      heap.push(exp);
    }
    else if(exp.amount > heap.peek().amount){
      heap.pop();
      heap.push(exp);
    }
  })
  return heap.toArray().sort((a, b) => b.amount - a.amount);
}
