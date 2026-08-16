import jwt from 'jsonwebtoken'

export const authenticate = (req ,res, next)=>{
    try{
        const authHeaders = req.headers.authorization;
        if(!authHeaders){
            return res.status(401).json({
                success:false,
                message:'Unauthorized'
            })
        }
        const token = authHeaders.split(' ')[1];
        if(!token){
           return res.status(401).json({
                success:false,
                message:'Unauthorized'
            })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = { id: token_decode.id };
        next()
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:error.message
        })
    }
}