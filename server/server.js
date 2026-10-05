import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import expenseRouter from './routes/expenseRoute.js';
import userRouter from './routes/userRoute.js';
import errorHandler from './middleware/errorHandler.js';
import budgetRouter from './routes/budgetRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cors());

app.get('/',(req ,res)=>{
    res.send("Server is running...")
});

app.get('/health',(req ,res)=>{
    res.json({
        status:'ok'
    })
});

app.use('/api/expenses', expenseRouter)
app.use('/api/auth',userRouter)
app.use('/api/budgets',budgetRouter)
app.use(errorHandler)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});