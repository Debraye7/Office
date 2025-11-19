import { Schema, model, models } from 'mongoose';
import "@users/models/User";

const DeskSchema = new Schema({
  title:{ type:String, unique:true, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  members:[{ type:Schema.Types.ObjectId, ref:'User' }],
}, { timestamps:true });

// delete models.Desk;

const DeskModel = models.Desk || model('Desk', DeskSchema);
export default DeskModel;