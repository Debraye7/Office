import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";
import "@folders/models/Folder";
import "@users/models/User";

const todoSchema = new Schema({
  text:{ type:String, required:[true, 'DB: Text required.'], minLength:[1, 'DB: Text must be at least 1 characters.'], maxLength:[600, 'DB: Text must be at most 600 characters.'], trim:true },
  completed:{ type:Boolean, default:false },
});

const attachmentSchema = new Schema({
  text:{ type:String, required:[true, 'DB: Text required.'], minLength:[1, 'DB: Text must be at least 1 characters.'], maxLength:[600, 'DB: Text must be at most 600 characters.'], trim:true },
  link:{ type:String, required:[true, 'DB: Link required.'], maxLength:[2000, 'DB: Description must be at most 2000 characters.'], trim:true },
});

const TaskSchema = new Schema({
  desk:{ type:Schema.Types.ObjectId, ref:'Desk', required:[true, 'DB: Desk required.'] },
  folder:{ type:Schema.Types.ObjectId, ref:'Folder', required:[true, 'DB: Folder required.'] },
  title:{ type:String, required:[true, 'DB: Title required.'], minLength:[1, 'DB: Title must be at least 1 characters.'], maxLength:[200, 'DB: Title must be at most 200 characters.'], trim:true },
  description:{ type:String, maxLength:[1500, 'DB: Description must be at most 1500 characters.'], trim:true },
  priority:{ type:String, enum:["Baja", "Media", "Alta"], default:"Media" },
  status:{ type:String, enum:["Pendiente", "En curso", "Finalizada", "Aprobada"], default:"Pendiente" },
  dueDate:{ type:Date, required:[true, 'DB: Due date required.'] },
  assignedTo:[{ type:Schema.Types.ObjectId, ref:'User' }],
  createdBy:{ type:Schema.Types.ObjectId, ref:'User' },
  attachments:{ type:[attachmentSchema], default:[] },
  todoChecklist:{ type:[todoSchema], required:true },
  progress:{ type:Number, default:0 },
}, { timestamps:true });

delete models.Task;

const TaskModel = models.Task || model('Task', TaskSchema);
export default TaskModel;