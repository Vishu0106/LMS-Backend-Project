import { Schema , model } from "mongoose";
import bcrypt from "bcryptjs"
import  jwt  from "jsonwebtoken";
import crypto from 'crypto'

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
        match:[/^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/gm,'Please fill the valid email address..']
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
    forgotPasswordExpiry:Date,
    subscription:{
        id:String,
        status:String
    }

},{timestamps:true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods = {
    comparePassword:async function(password){
        return await bcrypt.compare(password,this.password)
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
    },
    generatePasswordToken: async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');


        this.forgotPasswordToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');
      this.forgotPasswordExpiry = Date.now() +15*60*1000; // 15min from now
      return resetToken;
    }
}



export const User = model('User',userSchema);