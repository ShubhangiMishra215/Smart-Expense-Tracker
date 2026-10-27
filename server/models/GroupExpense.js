import mongoose from "mongoose";
import { rupeeToPaise } from "../utils/rupeeConversion.js";

const groupExpenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ["Groceries", "Leisure", "Electronics", "Utilities", "Clothing", "Health", "Others", "Food", "Transport"],
        required: true
    },
    amount: {
        type: Number,
        min: [0.01, "Amount must be greater than 0"],
        required: true
    },
    shares: {
        type: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                amount: {
                    type: Number,
                    min: [0, "Share cannot be negative"],
                    required: true
                }
            }
        ],
        validate: {
            validator: (arr) => arr.length > 0,
            message: "At least one share is required"
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

groupExpenseSchema.pre("validate", function () {
    const totalPaise = rupeeToPaise(this.amount);
    const sharesPaise = this.shares.reduce((sum, s) => sum + rupeeToPaise(s.amount), 0);

    if (sharesPaise !== totalPaise) {
        this.invalidate("shares", "Shares must add up to the total amount");
    }
});

groupExpenseSchema.index({ group: 1, date: -1 });

const GroupExpense = mongoose.model("GroupExpense", groupExpenseSchema);
export default GroupExpense;