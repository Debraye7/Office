import { Schema, model, models } from "mongoose";
import "@desks/models/Desk";
import "@folders/models/Folder";
import "@users/models/User";

const InventorySchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk required.'] },
  folder:{ type:Schema.Types.ObjectId, ref:'Folder', required:[true, 'DB: Folder required.'] },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  location:{ type:String, maxLength:[600, 'DB: Location must be at most 600 characters.'], trim:true },
  assignedTo:[{ type:Schema.Types.ObjectId, ref:'User' }],
}, { timestamps:true });

// delete models.Inventory;

const InventoryModel = models.Inventory || model('Inventory', InventorySchema);
export default InventoryModel;