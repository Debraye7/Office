import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";
import "@folders/models/Folder";
import "@users/models/User";

const AccountSchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk required.'] },
  folder:{ type:Schema.Types.ObjectId, ref:'Folder', required:[true, 'DB: Folder required.'] },
  assignedTo:[{ type:Schema.Types.ObjectId, ref:'User' }],
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  balance:{ type:Number, default:0 },
  type:{ type:String, enum:["debit", "credit", "cash", "cryptocurrency"], default:"cash" },
}, { timestamps:true });

delete models.Account;

const AccountModel = models.Account || model('Account', AccountSchema);
export default AccountModel;