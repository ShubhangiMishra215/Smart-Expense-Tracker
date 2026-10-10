import { addRecurringExpense } from "../services/RecurringExpenseService.js";

export const createRecurringExpense = async(req ,res , next)=>{
    try {
        const recurringExpense = await addRecurringExpense(req.user.id, req.body);
        return res.status(201).json({
            success:true,
            message:"Recurring expense created successfully",
            recurringExpense
        })
    } catch (error) {
        next(error)
    }
}