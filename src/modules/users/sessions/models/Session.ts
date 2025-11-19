import { Schema, model, models } from 'mongoose';
import "@users/models/User";

const SessionSchema = new Schema({
  user:{ type:Schema.Types.ObjectId, ref:'User', required:[true, 'DB: User id required'] },
  checkIn:{ type:Date, required:[true, 'DB: Check-in required.'] },
  checkOut:{ type:Date, default:null },
}, { timestamps:true });

const SessionModel = models.Session || model('Session', SessionSchema);
export default SessionModel;