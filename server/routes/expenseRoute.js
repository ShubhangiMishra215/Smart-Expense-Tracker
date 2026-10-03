import express from 'express';
import { createExpense, deleteExpense, getExpenseById, getExpenses, parseExpenseTextController, updateExpense } from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
const expenseRouter = express.Router();

expenseRouter.use(authenticate)

expenseRouter.post('/', createExpense);
expenseRouter.get('/', getExpenses);

expenseRouter.post('/parse', parseExpenseTextController);

expenseRouter.get('/:id', getExpenseById);
expenseRouter.patch('/:id', updateExpense);
expenseRouter.delete('/:id', deleteExpense);


export default expenseRouter;