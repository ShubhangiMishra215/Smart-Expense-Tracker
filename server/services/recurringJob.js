import nodeCron from "node-cron";
import { createExpenseFromRule, getDueRecurringExpenses } from "./RecurringExpenseService.js";

export const startRecurringJob = () => {
  nodeCron.schedule("* * * * *", async () => {
    try {
      const dueRules = await getDueRecurringExpenses();
      console.log(dueRules.length);
      console.log("Run it daily");     

      for (const rule of dueRules) {
        try {
          await createExpenseFromRule(rule);
        } catch (error) {
          console.error(`Failed for rule ${rule._id}:`, error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};
