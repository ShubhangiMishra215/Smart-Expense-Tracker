import { authenticate } from "../middleware/auth.js";
import express from "express";
import { getWeeklyReport } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/weekly',getWeeklyReport)

export default dashboardRouter;
