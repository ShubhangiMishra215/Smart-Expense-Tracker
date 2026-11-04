import { addGroup, addGroupExpense, addSettlement, getGroupBalances, getSettlementSuggestions, getUserGroups } from "../services/group.js";
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

export const getGroupBalancesController = async(req,res,next)=>{
    try {
        const balances = await getGroupBalances(req.params.id, req.user.id);
        return res.status(200).json({
            success:true,
            message: "Group balance fetched successfully",
            balances
        })
    } catch (error) {
        next(error);
    }
}

export const addSettlementController = async(req, res, next)=>{
    try {
       const settlement = await addSettlement(req.user.id, req.params.id, req.body);
        return res.status(201).json({
            success:true,
            message:"Settlement added successfully",
            settlement
        })
    } catch (error) {
        next(error);
    }
}

export const getSettlementSuggestionsController = async(req ,res ,next)=>{
    try {
        const result = await getSettlementSuggestions(req.params.id, req.user.id);
        return res.status(200).json({
            success:true,
            message:"Suggestions fetched successfully",
            result
        })
    } catch (error) {
        next(error);
    }
}

export const getUserGroupsController = async (req, res, next) => {
  try {
    const groups = await getUserGroups(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      groups,
    });
  } catch (error) {
    next(error);
  }
};