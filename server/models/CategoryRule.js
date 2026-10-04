import mongoose from "mongoose";

const CategoryRuleSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    keyword:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
    },
    category:{
        type:String,
        enum:["Groceries","Leisure","Electronics","Utilities","Clothing","Health","Others","Food","Transport"],
        required:true,
    }
}, {timestamps:true})

CategoryRuleSchema.index({user:1, keyword:1}, {unique:true});

const CategoryRule = mongoose.model('CategoryRule',CategoryRuleSchema);
export default CategoryRule;