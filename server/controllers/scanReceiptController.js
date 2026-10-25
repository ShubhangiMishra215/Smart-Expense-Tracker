import { getBudgetAlert } from "../services/budgetServices.js";
import { scanReceiptExpense } from "../services/receiptScan.js";

export const scanReceiptController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file found",
      });
    }

    const expense = await scanReceiptExpense(req.user.id, req.file);

    let alerts = [];
    try {
      const alert = await getBudgetAlert(req.user.id, expense.category);
      if (alert) alerts.push(alert);
    } catch (err) {
      console.error("Budget alert failed:", err);
    }
    return res.status(201).json({
      success: true,
      message: "Response created successfully",
      expense,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};
