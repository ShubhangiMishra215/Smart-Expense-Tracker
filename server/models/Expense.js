import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    amount:{
        type:Number,  
        min:[0.01, 'Amount cannot be negative'],      
        required:true,
    },
    category:{
        type:String,
        enum:["Groceries","Leisure","Electronics","Utilities","Clothing","Health","Others","Food","Transport"],
        required:true,
    },
    description:{
        type:String       
    },
    date:{
        type:Date,
        default:Date.now
    }
}, {timestamps:true});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;