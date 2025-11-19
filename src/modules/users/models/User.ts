import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name:{ type:String, required:[true, 'DB: Name required.'], minLength:[1, 'DB: Name must be at least 1 characters.'], maxLength:[50, 'DB: Name must be at most 50 characters.'], trim:true },
  email:{ type:String, required:[true, 'DB: Email required.'], trim:true, unique:true },
  password:{ type:String, required:[true, 'DB: Password required.'], minLength:[6, 'DB: Password must be at least 6 characters.'], select:false },
  profileImageUrl: { type:String, default:null },
  role:{ type:String, enum:["owner", "admin", "user", "client"], default:"user" },
}, { timestamps:true });

const UserModel = models.User || model('User', UserSchema);
export default UserModel;