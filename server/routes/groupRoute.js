import express from "express";
import { authenticate } from "../middleware/auth.js";
import { addSettlementController, createGroupController, createGroupExpenseController, getGroupBalancesController } from "../controllers/groupController.js";

const groupRouter = express.Router();
groupRouter.use(authenticate);

groupRouter.post("/",createGroupController);
groupRouter.post("/:id/expenses",createGroupExpenseController);
groupRouter.get("/:id/balances",getGroupBalancesController);
groupRouter.post("/:id/settlements",addSettlementController);

export default groupRouter;
