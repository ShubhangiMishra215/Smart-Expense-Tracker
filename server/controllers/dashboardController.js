import {
  getExpenseByCategory,
  getMonthlySummary,
  getTopK,
  getWeeklyComparison,
} from "../services/dashboard.js";

export const getWeeklyReport = async (req, res, next) => {
  try {
    const report = await getWeeklyComparison(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Weekly report found successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryReport = async (req, res, next) => {
  try {
    const report = await getExpenseByCategory(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Category report found successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopKExpense = async (req, res, next) => {
  try {
    const { k, month, year } = req.query;

    const Month = Number(month);
    const Year = Number(year);
    const K = Number(k);

    if (
      !Number.isInteger(K) ||
      K <= 0 ||
      !Number.isInteger(Month) ||
      Month < 1 ||
      Month > 12 ||
      !Number.isInteger(Year) ||
      Year < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Incorrect or missing values",
      });
    }
    const startDate = new Date(Year, Month - 1, 1);
    const nextStart = new Date(Year, Month, 1);

    const response = await getTopK(req.user.id, K, startDate, nextStart);
    return res.status(200).json({
      success: true,
      message: "Top expenses fetched successfully",
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySummaryReport = async (req, res, next) => {
  try {
    const {month, year } = req.query;

    const Month = Number(month);
    const Year = Number(year);
    
    if (
      !Number.isInteger(Month) ||
      Month < 1 ||
      Month > 12 ||
      !Number.isInteger(Year) ||
      Year < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Incorrect or missing values",
      });
    }

    const response = await getMonthlySummary(req.user.id, Month, Year);
    return res.status(200).json({
        success:true,
        message:"Monthly report generated",
        response
    })
  } catch (error) {
    next(error);
  }
};
