import { Schema, model, models } from 'mongoose';
import "@accounts/models/Account";
import "@categories/models/Category";
import "@users/models/User";

const TransactionSchema = new Schema({
  account:{ type:Schema.Types.ObjectId, ref:'Account', required:[true, 'DB: Account required.'] },
  category:{ type:Schema.Types.ObjectId, ref:'Category', default:undefined },
  type: { type:String, enum:["income", "expense"], required:true },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  description: { type:String, maxLength:[600, 'DB: Title must be at most 600 characters.'], trim:true },
  amount:{ type:Number, required:true },
  date:{ type:Date, default:Date.now },
  createdBy:{ type:Schema.Types.ObjectId, ref:'User', required:true },
  status: { type: String, enum: ["Pendiente", "Finalizado", "Cancelado"], default:"Finalizado" },
}, { timestamps:true });

TransactionSchema.index({ account:1 });
TransactionSchema.index({ createdBy:1 });
TransactionSchema.index({ date:-1 });

const TransactionModel = models.Transaction || model('Transaction', TransactionSchema);
export default TransactionModel;