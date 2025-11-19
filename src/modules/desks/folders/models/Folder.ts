import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";

const FolderSchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk id required'] },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
}, { timestamps:true });

// delete models.Folder;

const FolderModel = models.Folder || model('Folder', FolderSchema);
export default FolderModel;