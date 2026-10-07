import { getExpenseByCategory, getWeeklyComparison } from "../services/dashboard.js"

export const getWeeklyReport = async(req ,res, next)=>{
    try {
        const report = await getWeeklyComparison(req.user.id);
        return res.status(200).json({
            success:true,
            message:"Weekly report found successfully",
            report
        })
    } catch (error) {
        next(error)
    }
}

export const getCategoryReport = async(req,res,next)=>{
    try {
        const report = await getExpenseByCategory(req.user.id);
        return res.status(200).json({
            success:true,
            message:"Category report found successfully",
            report
        })
    } catch (error) {
        next(error)
    }
}