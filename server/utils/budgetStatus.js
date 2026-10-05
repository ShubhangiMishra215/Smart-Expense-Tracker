export const getBudgetStatus = (percentUsed)=>{
    if(percentUsed < 80) return("ok");
    else if(percentUsed<100) return("warning");
    else return("exceeded")
}