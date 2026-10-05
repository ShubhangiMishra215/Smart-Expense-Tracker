import Budget from "../models/Budget.js";
import AppError from "../utils/AppError.js";


export const upsertBudget = async(userId,budgetData)=>{
    const category = budgetData.category;
    const limit = budgetData.limit;
    if(!category || !limit){
        throw new AppError("Missing fields",400)
    }
    const budget =await Budget.findOneAndUpdate({
        user:userId,
        category
    },{limit},{upsert: true, new: true, runValidators: true })

    return budget;
}

export const fetchBudgets = async(userId)=>{
    const budgets = await Budget.find({user : userId});
    return budgets;
}

export const removeBudget = async(userId,budgetData)=>{
    const category = budgetData.category;
    if(!category){
        throw new AppError("Missing fields",400);
    }
    const budget = await Budget.findOneAndDelete({
        user : userId,
        category
    })
    return budget;
}