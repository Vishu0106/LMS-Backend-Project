import AppError  from "../utils/appError.js"
import {User} from "../models/user.model.js"


const cookieOptions = {
    secure:true,
    maxAge:7*24*60*1000, // 7days
    httpOnly:true
}


export const register =  async(req , res) => {
    const {fullName , email , password} = req.body;
    if(!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));
    }

    const userExits = User.findOne({email});

    if(userExits) {
        return next(new AppError('user already exits',400))
    } 

    const user = await User.create({
       fullName,
       email,
       password,
       avatar:{
        public_id:email,
        secure_url: 'https://'
       } 
    });

    if(!user) {
        return next('user registration failed', 400);
    }

    // TODO upload user avatar



    await User.save();

    // TODO : set jwt token in cookie 
    user.password=undefined;
    res.status(200).json({
        success:true,
        message:'user register is succesfull',
        user
    })
}
export const login = async (req , res, next) => {
    const {email, password } = req.body

    if(!email || !password){
        return next(new AppError('All fileds are mandatory'))
    }

    const user = await User.findOne({
        email
    }).select("-password")

    if(!user || !user.comparePassword(password)) {
        return next(new AppError('Email or password do not match',400))
    }

    const token = await user.generateToken()
    user.password = undefined;

    res.cookie("token",token,cookieOptions); // setting the cookie

    res.status(201).json({
        success:true,
        message:'User login sucessfull'
    })
    
}
export const logout = (req , res) => {

    res.cookie('token', null ,cookieOptions)
    
    res.status(200).json({
        success:true,
        message:"user logged out successfully"
    })
    
}
export const getProfile = (req , res, next) => {

    const user = User.findById(req.user.id).select("-password");


    if(!user) {
        return next( new AppError('user nnot found',400));
    }

    res.status(200).json({
        success:true,
        message:'User details',
        user
    })
}
