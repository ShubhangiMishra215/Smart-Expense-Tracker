import { uploadReceipt } from "../config/cloudinary.js";
import CategoryRule from "../models/CategoryRule.js";
import { parseReceipt } from "./aiParserService.js"
import { addExpense } from "./expenseServices.js";

export const scanReceiptExpense = async (userId, image) => {
  const parsed = await parseReceipt(image);

  const rules = await CategoryRule.find({ user: userId });
  const ruleMap = new Map();
  rules.forEach((rule) => {
    ruleMap.set(rule.keyword, rule.category);
  });

  let category = parsed.category;
  if (parsed.description) {
    const ruleCat = ruleMap.get(parsed.description.toLowerCase().trim());
    if (ruleCat) category = ruleCat;
  }

  const receiptUrl = await uploadReceipt(image.buffer);

  // TODO: delete the Cloudinary image if this save fails
  const expense = await addExpense(userId, {
    ...parsed,
    category,
    receiptUrl,
  });

  return expense;
};