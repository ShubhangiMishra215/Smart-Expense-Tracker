import { authenticate } from "../middleware/auth.js";
import express from "express";
import { getCategoryReport, getMonthlySummaryReport, getTopKExpense, getWeeklyReport } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/weekly',getWeeklyReport);
dashboardRouter.get('/category',getCategoryReport);
dashboardRouter.get('/topK', getTopKExpense);
dashboardRouter.get('/summary',getMonthlySummaryReport);

export default dashboardRouter;
