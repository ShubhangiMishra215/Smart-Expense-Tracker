import { addGroup, addGroupExpense } from "../services/group.js";
import AppError from "../utils/AppError.js";

export const createGroupController = async(req ,res , next)=>{
    
    try {
        const {name , members} = req.body;
        if(!name || !name.trim()) throw new AppError("Group name is required",400);
        const group = await addGroup(name.trim(), req.user.id, members);
        return res.status(201).json({
            success : true,
            message:"Group created successfully",
            group
        })
    } catch (error) {
        next(error)
    }
}

export const createGroupExpenseController = async(req ,res, next)=>{
    try {
        const groupExpense = await addGroupExpense( req.user.id, req.params.id, req.body);
        return res.status(201).json({
            success : true,
            message:"Group expense created successfully",
            groupExpense
        })
    } catch (error) {
        next(error)
    }
}