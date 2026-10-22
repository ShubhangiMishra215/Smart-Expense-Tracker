import nodeCron from "node-cron";
import {
  getDueRecurringExpenses,
  processRule,
} from "./RecurringExpenseService.js";

export const startRecurringJob = () => {
  nodeCron.schedule(
    "5 0 * * *",
    async () => {
      try {
        const dueRules = await getDueRecurringExpenses();
        console.log(dueRules.length);
        console.log("Run it daily");

        for (const rule of dueRules) {
          try {
            await processRule(rule);
          } catch (error) {
            console.error(`Failed for rule ${rule._id}:`, error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    { timezone: "Asia/Kolkata" },
  );
};
