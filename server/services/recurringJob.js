import nodeCron from "node-cron";
import { getDueRecurringExpenses } from "./RecurringExpenseService.js";

export const startRecurringJob = () => {
  nodeCron.schedule("* * * * *", async () => {
    try {
      const expense = await getDueRecurringExpenses();
      console.log(expense.length);
      console.log("Run it daily");
    } catch (error) {
      console.error(error);
    }
  });
};
