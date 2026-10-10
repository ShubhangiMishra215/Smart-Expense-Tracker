import RecurringExpense from "../models/RecurringExpense.js";

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