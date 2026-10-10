import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import { getWindowBoundaries } from "../utils/getWindowBoundaries.js";
import { getMonthlyExpense } from "./budgetServices.js";
import MinHeap from "../utils/MinHeap.js";
import { fetchExpenses } from "./expenseServices.js";
import { generateSummaryData } from "./aiParserService.js";

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

export const getMonthlyData = async(userId, month, year)=>{
  const startDate = new Date(year,month-1,1);
  const nextStart = new Date(year,month,1);
  const endDate = new Date(nextStart.getTime()-1);

  const prevStart = new Date(year,month-2,1);
  
  const expenses = await fetchExpenses(userId, {filter: "custom", startDate, endDate});
  const prevTotal = await getTotalSpend(userId,prevStart,startDate);

  let total = 0;
  const catMap = new Map();
  expenses.forEach((exp)=>{
    total+=exp.amount;
    catMap.set(exp.category,(catMap.get(exp.category) || 0) + exp.amount);
  })
  

  const breakdown = Array.from(catMap, ([category, amount]) => ({
    category,
    amount,
    percentage: total===0 ? 0 : Number(((amount / total) * 100).toFixed(1)),
  }));
  breakdown.sort((a, b) => b.amount - a.amount);

  const top = await getTopK(userId,5,startDate,nextStart);  
  const topExpenses = top.map((e)=>({
    category:e.category,
    description: e.description,
    amount : e.amount
  }))

  return {month,year,total,prevTotal,breakdown,topExpenses};

}

export const getMonthlySummary = async(userId,month,year)=>{
  const data = await getMonthlyData(userId, month,year);
  if (data.total === 0) {
    return { summary: "No expenses recorded for this month.", tips: [], data };
  }

  const { summary, tips } = await generateSummaryData(data);
  return { summary, tips, data };
};