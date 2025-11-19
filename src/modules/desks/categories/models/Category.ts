import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";

const CategorySchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk id required'] },
  type:{ type:String, enum: ["transaction", "movement", "product", "item"], required:[true, 'DB: Label required.'] },
  icon:{ type:Number, require:[true, 'DB: Icon required.'] },
  label:{ type:String, required:[true, 'DB: Value required.'], minLength:[1, 'DB: Value must be at least 1 characters.'], maxLength:[200, 'DB: Value must be at most 200 characters.'], trim:true },
}, { timestamps:true });

const CategoryModel = models.Category || model('Category', CategorySchema);
export default CategoryModel;