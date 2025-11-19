import { Schema, model, models } from "mongoose";
import "@desks/models/Desk";
import "@categories/models/Category";

const ProductSchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk required.'] },
  category:{ type:Schema.Types.ObjectId, ref:'Category', default:undefined },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  description:{ type:String, maxLength:[1500, 'DB: Description must be at most 1500 characters.'], trim:true },
  price:{ type:Number, default:0 },
  stock:{ type:Number, default:0 },
  imageUrl:{ type:String, require:[true, 'Image url required'] },
}, { timestamps:true });

// delete models.Product;

const ProductModel = models.Product || model('Product', ProductSchema);
export default ProductModel;