import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv/config";
import AppError from "../utils/AppError.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CATEGORIES = ["Groceries", "Leisure", "Electronics", "Utilities", "Clothing", "Health", "Others","Food","Transport"];

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
}

export const parseExpenseText =  async(text)=> {
  
  const today = new Date().toLocaleDateString("en-CA", {timeZone : "Asia/Kolkata"}); // Format: YYYY-MM-DD
  
  const prompt = `Extract every expense from the text below.
    Today's date is ${today}. Resolve "today" and "yesterday" to YYYY-MM-DD.
    Amounts are in INR. Use only these categories: ${CATEGORIES.join(", ")}.
    If there are no expenses, return an empty array.

    Text: ${text}`;

  let interaction;

  try{
    interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schema,
      }
    });
  }
  catch(error){
    console.error("Error parsing expense text:", error);
    if(error.status === 429){
      throw new AppError("Rate limit exceeded. Please try again later.", 429);
    }
    throw new AppError("AI service unavailable", 502);
  }

  let parsed;

  try{
    parsed = JSON.parse(interaction.output_text);
  }

  catch(error){
    throw new AppError("Could not understand the AI response", 502);
  }

  if(!Array.isArray(parsed)){
    throw new AppError("AI response cannot be understood", 502);
  }

  const validated = parsed
  .filter((item)=> typeof item.amount === "number" && item.amount>0)
  .map(((item)=>({
    amount: item.amount,
    category: CATEGORIES.includes(item.category) ? item.category : "Others",
    description: typeof item.description === "string" ? item.description : "",
    date: item.date || today,
  })));

  if( validated.length === 0 ){
    throw new AppError("No valid expenses found in the text", 400);
  }

  return validated;
  
}
