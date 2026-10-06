import { getWeeklyComparison } from "../services/dashboard.js"

export const getWeeklyReport = async(req ,res, next)=>{
    try {
        const report = await getWeeklyComparison(req.user.id);
        return res.status(200).json({
            success:true,
            message:"Report found successfully",
            report
        })
    } catch (error) {
        next(error)
    }
}