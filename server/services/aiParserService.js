import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv/config";
import AppError from "../utils/AppError.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CATEGORIES = [
  "Groceries",
  "Leisure",
  "Electronics",
  "Utilities",
  "Clothing",
  "Health",
  "Others",
  "Food",
  "Transport",
];

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      amount: { type: "number" },
      category: { type: "string", enum: CATEGORIES },
      description: { type: "string" },
      date: { type: "string", format: "date" },
    },
    required: ["amount", "category", "description", "date"],
  },
};

const summarySchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    tips: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "tips"],
};

export const parseExpenseText = async (text) => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }); // Format: YYYY-MM-DD

  const prompt = `Extract every expense from the text below.
    Today's date is ${today}. Resolve "today" and "yesterday" to YYYY-MM-DD.
    Amounts are in INR. Use only these categories: ${CATEGORIES.join(", ")}.
    If there are no expenses, return an empty array.

    Text: ${text}`;

  let interaction;

  try {
    interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schema,
      },
    });
  } catch (error) {
    console.error("Error parsing expense text:", error);
    if (error.status === 429) {
      throw new AppError("Rate limit exceeded. Please try again later.", 429);
    }
    throw new AppError("AI service unavailable", 502);
  }

  let parsed;

  try {
    parsed = JSON.parse(interaction.output_text);
  } catch (error) {
    throw new AppError("Could not understand the AI response", 502);
  }

  if (!Array.isArray(parsed)) {
    throw new AppError("AI response cannot be understood", 502);
  }

  const validated = parsed
    .filter((item) => typeof item.amount === "number" && item.amount > 0)
    .map((item) => ({
      amount: item.amount,
      category: CATEGORIES.includes(item.category) ? item.category : "Others",
      description: typeof item.description === "string" ? item.description : "",
      date: item.date || today,
    }));

  if (validated.length === 0) {
    throw new AppError("No valid expenses found in the text", 400);
  }

  return validated;
};

export const generateSummaryData = async (data) => {
  const monthName = new Date(data.year, data.month - 1, 1).toLocaleString(
    "en-IN",
    { month: "long" },
  );

  const prompt = `You are a friendly personal finance assistant.
Below is a user's spending data for ${monthName} ${data.year}. All amounts are in INR.

Data:
${JSON.stringify(data)}

Write "summary": 2-3 sentences describing the month's spending. Mention the total and the biggest category.
${
  data.prevTotal === 0
    ? "There is no spending data for the previous month, so do NOT compare with it or say spending went up or down."
    : "Compare the total with prevTotal (the previous month's total)."
}
Write "tips": exactly 3 short, specific tips based on the categories shown.
Rules: use only the numbers provided, do not invent figures, say "spending" and never "budget" (no budget data is provided), no markdown.`;
  
let interaction;

  try {
    interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: summarySchema, // was `schema`, which is the array schema for expenses
      },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    if (error.status === 429) {
      throw new AppError("Rate limit exceeded. Please try again later.", 429);
    }
    throw new AppError("AI service unavailable", 502);
  }

  let parsed;

  try {
    parsed = JSON.parse(interaction.output_text);
  } catch (error) {
    throw new AppError("Could not understand the AI response", 502);
  }

  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.tips) ||
    !parsed.tips.every((t) => typeof t === "string")
  ) {
    throw new AppError("AI response cannot be understood", 502);
  }

  return { summary: parsed.summary, tips: parsed.tips };
};
