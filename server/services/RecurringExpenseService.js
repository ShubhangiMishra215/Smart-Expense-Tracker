import RecurringExpense from "../models/RecurringExpense.js";
import AppError from "../utils/AppError.js";
import { getNextDueDate } from "../utils/nextDueDate.js";

export const addRecurringExpense = async (userId, expenseData) => {
  const { category, amount, description, frequency, nextDueDate } = expenseData;
  const date = new Date(nextDueDate);

  let dayOfMonth;
  if (frequency === "Monthly") {
    dayOfMonth = date.getDate();
  }

  const newExpense = new RecurringExpense({
    user: userId,
    category,
    amount,
    description,
    frequency,
    nextDueDate: date,
    dayOfMonth,
  });
  const expense = await newExpense.save();
  return expense;
};

export const fetchRecurringExpense = async (userId) => {
  const expense = await RecurringExpense.find({ user: userId, isActive: true });
  return expense;
};

export const removeRecurringExpense = async (userId, ruleId) => {
  const expense = await RecurringExpense.findOneAndDelete({
    user: userId,
    _id: ruleId,
  });

  return expense;
};

export const deactivateRecurringExpense = async (userId, ruleId) => {
  const rule = await RecurringExpense.findOne({ user: userId, _id: ruleId });
  if (!rule) throw new AppError("No such rule found", 404);

  if (rule.isActive === false) {
    throw new AppError("It is already paused", 400);
  }

  rule.isActive = false;
  await rule.save();
  return rule;
};

export const reactivateRecurringExpense = async (userId, ruleId) => {
  const oldExpense = await RecurringExpense.findOne({
    user: userId,
    _id: ruleId,
  });
  if (!oldExpense) throw new AppError("No such rule found", 404);

  const currentDate = new Date(Date.now());
  let dayOfMonth;
  const frequency = oldExpense.frequency;

  frequency == "Monthly"
    ? (dayOfMonth = currentDate.getDate())
    : (dayOfMonth = oldExpense.dayOfMonth);
  if (oldExpense.isActive === true) {
    throw new AppError("It is already active", 400);
  }

  const expense = await RecurringExpense.findOneAndUpdate(
    {
      user: userId,
      _id: ruleId,
    },
    {
      isActive: true,
      dayOfMonth: dayOfMonth,
      nextDueDate: getNextDueDate(currentDate, frequency, dayOfMonth),
    },
    { returnDocument: "after" },
  );
  if (!expense) throw new AppError("No such rule found", 404);
  return expense;
};
