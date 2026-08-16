import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim : true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim : true,
        lowercase:true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password:{
        type:String,
        required:true,
        minlength : 10,
    },

},{timestamps:true})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword = async function(userPassword){
    return await bcrypt.compare(userPassword,this.password)
}

const User = mongoose.model('User', userSchema);
export default User;