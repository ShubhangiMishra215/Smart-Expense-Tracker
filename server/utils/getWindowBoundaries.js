export const getWindowBoundaries = ()=>{
    const day = new Date();
    const today = new Date(day.setHours(0,0,0,0));
    const copyToday = new Date(day.setHours(0,0,0,0));
    const sevenDaysAgo = new Date(copyToday.setDate(copyToday.getDate()-7));
    const fourteenDaysAgo = new Date(copyToday.setDate(copyToday.getDate()-7));
    return {today,sevenDaysAgo,fourteenDaysAgo};
}