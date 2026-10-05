import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'User'
    },
    category:{
        type:String,
        enum:["Groceries","Leisure","Electronics","Utilities","Clothing","Health","Others","Food","Transport"],
        required:true,
    },
    limit:{
        type:Number,
        min : [0.01, 'Limit should be greater than 0'],
        required:true,
    }
},{timestamps:true})

budgetSchema.index({user:1,category:1},{unique:true});

const Budget = mongoose.model("Budget",budgetSchema);
export default Budget;