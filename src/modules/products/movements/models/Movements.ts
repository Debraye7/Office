import { Schema, model, models } from 'mongoose';
import "@accounts/models/Account";
import "@categories/models/Category";
import "@users/models/User";

const MovementSchema = new Schema({
  product:{ type:Schema.Types.ObjectId, ref:'Product', required:[true, 'DB: Product required.'] },
  category:{ type:Schema.Types.ObjectId, ref:'Category', default:undefined },
  type: { type:String, enum:["outflow", "inflow"], required:true },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  description: { type:String, maxLength:[600, 'DB: Title must be at most 600 characters.'], trim:true },
  quantity:{ type:Number, required:true },
  date:{ type:Date, default:Date.now },
  createdBy:{ type:Schema.Types.ObjectId, ref:'User', required:true },
  status: { type: String, enum: ["Pendiente", "Finalizado", "Cancelado"], default:"Finalizado" },
}, { timestamps:true });

// TransactionSchema.index({ account:1 });
// TransactionSchema.index({ createdBy:1 });
// TransactionSchema.index({ date:-1 });

delete models.Movement;

const MovementModel = models.Movement || model('Movement', MovementSchema);
export default MovementModel;