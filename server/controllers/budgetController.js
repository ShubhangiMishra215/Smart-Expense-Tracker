import { fetchBudgets, removeBudget, upsertBudget } from "../services/budgetServices.js";

export const setBudget = async (req, res, next) => {
  try {
    const budget = await upsertBudget(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Budget set successfully",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

export const getBudget = async(req,res,next)=>{
    try {
        const budgets = await fetchBudgets(req.user.id);
        return res.status(200).json({
            success:true,
            message:"Budgets fetched successfully",
            budgets,
        })
    } catch (error) {
        next(error)
    }    
}

export const deleteBudget = async(req,res,next)=>{    
    try {
        const budget = await removeBudget(req.user.id, req.params);
        if(!budget){
            return res.status(404).json({
                success:false,
                message:"No such budget found"
            })
        }
        return res.status(204).end();
    } catch (error) {
        next(error)
    }    
}