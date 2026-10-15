import RecurringExpense from "../models/RecurringExpense.js";
import AppError from "../utils/AppError.js";

export const addRecurringExpense = async(userId , expenseData)=>{
    
    const {category, amount,description,frequency,nextDueDate} = expenseData;
    const date = new Date(nextDueDate);
    
    let dayOfMonth;
    if(frequency==="Monthly"){
        dayOfMonth = date.getDate();
    }

    const newExpense = new RecurringExpense({
        user:userId,
        category,
        amount,
        description,
        frequency,
        nextDueDate:date,
        dayOfMonth
    })
    const expense = await newExpense.save();
    return expense;        
}

export const fetchRecurringExpense = async(userId)=>{
    const expense = await RecurringExpense.find({user:userId, isActive:true});
    return expense;
}

export const removeRecurringExpense = async(userId,ruleId)=>{
    const expense = await RecurringExpense.findOneAndDelete({
        user:userId,
        _id:ruleId
    });

    return expense
}