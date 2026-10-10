import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      enum: [
        "Groceries",
        "Leisure",
        "Electronics",
        "Utilities",
        "Clothing",
        "Health",
        "Others",
        "Food",
        "Transport",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["Weekly", "Monthly", "Yearly"],
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const RecurringExpense = mongoose.model(
  "RecurringExpense",
  recurringExpenseSchema,
);
export default RecurringExpense;
