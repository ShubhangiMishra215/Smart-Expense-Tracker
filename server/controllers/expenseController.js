import CategoryRule from "../models/CategoryRule.js";
import { parseExpenseText } from "../services/aiParserService.js";
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

export const parseExpenseTextController = async (req, res, next) => {
  try {
    const response = req.body.text;
    if (typeof response !== "string" || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: "No user input",
      });
    }

    const parsed = await parseExpenseText(response);

    const rules = await CategoryRule.find({
      user: req.user.id,
    });

    const ruleMap = new Map();
    rules.forEach(element => {
      ruleMap.set(element.keyword, element.category);
    });
    

    const finalItems = parsed.map((item) => {
      if (item.description) {
        const key = item.description.toLowerCase().trim();
        const ruleCat = ruleMap.get(key);
        if (ruleCat) {
          return { ...item, category: ruleCat };
        }        
      }
      return item;
    });

    const expenses = await Promise.all(
      finalItems.map((item) => addExpense(req.user.id, item)),
    );

    return res.status(201).json({
      success: true,
      message: "Response created successfully",
      expenses,
    });
  } catch (error) {
    next(error);
  }
};
