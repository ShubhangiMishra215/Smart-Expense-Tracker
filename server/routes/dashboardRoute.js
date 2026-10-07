import { authenticate } from "../middleware/auth.js";
import express from "express";
import { getCategoryReport, getWeeklyReport } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/weekly',getWeeklyReport);
dashboardRouter.get('/category',getCategoryReport);

export default dashboardRouter;
