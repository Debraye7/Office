import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";
import "@users/models/User";
import "@products/models/Product";

const SaleSchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk required.'] },
  date:{ type:Date, default:new Date() },
  name:{ type:String, default:`#${new Date().getTime()}`, minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  cart:[{ product:{ type:Schema.Types.ObjectId, ref:'Product' }, quantity:{ type:Number, require:true, min:1 }, subtotal:{ type:Number, require:true, min:0 } }],
  total:{ type:Number, require:true },
  status:{ type:String, enum:['pending', 'completed', 'cancelled'], default:'pending' },
  createdBy:{ type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true });

delete models.Sale;

const SaleModel = models.Sale || model('Sale', SaleSchema);
export default SaleModel;