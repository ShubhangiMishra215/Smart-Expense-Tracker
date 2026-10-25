import mongoose from "mongoose";

const connectDB = async()=>{
    mongoose.connection.on('connected', ()=>console.log("Database connected"))
    await mongoose.connect(`${process.env.MONGODB_URL}`)
    // after mongoose.connect(...) succeeds
console.log("DB name:", mongoose.connection.name);
console.log("DB host:", mongoose.connection.host);
}

export default connectDB