import mongoose, { Document, ObjectId, Schema } from "mongoose";


interface IUser extends Document {
    isBlocked: boolean;
    _id : ObjectId;
    name : string;
    email : string;
    password : string;
    mobile_no : string;
    gender : string;
    role : string;
    medical_History : string;
    DOB : Date;
    url : string;
    address : string;
    is_verified : boolean;
    isblocked : boolean;
    is_deleted : boolean;
}


const userSchema : Schema = new Schema({
    name: String,
    email: String,
    password: String,
    mobile_no: String,
    gender : String,
    role : String,
    medical_History : String,
    DOB : Date,
    url : String,
    is_blocked: {
        type: Boolean,
        default: false,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    
},{timestamps : true})

const userModel = mongoose.model<IUser>('User' , userSchema)

export default userModel

export {IUser}