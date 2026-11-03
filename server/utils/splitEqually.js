import { PaiseToRupee, rupeeToPaise } from './rupeeConversion.js';
import AppError from './AppError.js'

export const splitEqually = (totalAmount, participantsIds, payerId) =>{
        if(!participantsIds.length){
            throw new AppError('At least one participant is required',400);
        }
        const ids = participantsIds.map(String);
        const payer = String(payerId);

        if(!ids.includes(payer)){
            throw new AppError("Payer must be one of the paricipants",400);
        }

        const paise = rupeeToPaise(totalAmount);
        const base = Math.floor(paise/ids.length);
        const leftOver = paise%ids.length;

        const sharesInPaise = ids.map((id)=>({
            user:id,
            amount: id===payer ? base+leftOver : base
        }));

        const sum = sharesInPaise.reduce((total, share)=> total + share.amount, 0);
        if(sum!=paise){
            throw new AppError("Shares do no add up to the total", 500);
        }

        return sharesInPaise.map((share)=>({
            user:share.user,
            amount:PaiseToRupee(share.amount),
        }));
}