import { Schema, model, models } from 'mongoose';
import "@desks/models/Desk";
import "@folders/models/Folder";
import "@users/models/User";

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

const EventSchema = new Schema(
  {
    desk:{
      type:Schema.Types.ObjectId,
      ref:"Desk",
      required:[true, "DB: Desk required."]
    },
    folder:{
      type:Schema.Types.ObjectId,
      ref:"Folder",
      required:[true, "DB: Folder required."]
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: String,
      enum: recurrenceOptions,
      default: 'none',
    },
    recurrenceEnd: {
      type: Date,
    },
    createdBy:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    assignedTo:[{
      assigned:{ type:Schema.Types.ObjectId, ref:"User" },
      status:{ type:String, enum:["pending", "accepted", "declined"], default:"pending" }
    }],

  },
  { timestamps: true }
);

delete models.Event;

const EventModel = models.Event || model('Event', EventSchema);
export default EventModel;