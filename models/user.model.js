import { Schema , model } from "mongoose";
import bcryptjs from "bcryptjs"
import  jwt  from "jsonwebtoken";

const userSchema = new Schema({
    fullName : {
        type:String,
        required:[true,"Email is requied"],
        minLength:[5,'Name must be atlesat 5 charcters'],
        maxLength: [50,'Name must be less than 50 charcets'],
        lowercase:true,
        trim:true

    },
    email: {
        type:String,
        required: [true,'Email is requied'],
        unique:true,
        trim:true,
        match:[

        ]
    },
    password:{
        type:String,
        required:[true,'Password must be required'],
        minLenght:[8,'Password must be 8 charcaters'],
        select:false
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    avatar:{
        public_id: {
            type:String
        },
        secure_url : {
            type:String
        }
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date

},{timestamps:true});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcryptjs.hash(this.password,10);
})

userSchema.methods = {
    comparePassword:async function(password){
        return await bcryptjs.compare(password,this.password)
    },
    generateJWTToken: function() {
        return jwt.sign(
            {
                id: this._id,
                role:this.role,
                email:this.email,
                subscription:this.subscription
            },
            process.env.JWT_SECRET,
            {
                expiresIn : process.env.JWT_EXPIRY
            }
        )
    }
}



export const User = model('User',userSchema);