import AppError  from "../utils/appError.js "
import {User} from "../models/user.model.js"
import cloudinary from "cloudinary"
import {sendEmail} from "../utils/sendEmail.js"



const cookieOptions = {
    secure:true,
    maxAge:7*24*60*1000, // 7days
    httpOnly:true
}


export const register =  async(req , res, next) => {
    const {fullName , email , password} = req.body;
    if(!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));
    }

    const userExits = await User.findOne({email});

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

    if(req.file) {
        try {

            const avatar = await cloudinary.v2.uploader(req.file.path ,{
                floder: 'lms',
                width: 250,
                height:250,
                gravity: 'faces', // get image size reduce
                crop:'fill'
            })

            if(avatar) {
                user.avatar.public_id = avatar.public_id;
                user.avatar.secure_url = avatar.secure_url
            }

            // remove file from local server
            fs.rm(`uploads/${req.file.filename}`)
            
        } catch (error) {
           return next(new AppError(error.message || 'File not uploaded to cloud , please try again', 500)) 
        }
    }



    await user.save();

    // TODO : set jwt token in cookie 
    const token = await user.generateToken();

    res.cookie('token',token, cookieOptions);
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
        return next(new AppError('All fileds are mandatory',400))
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
export const getProfile = async(req , res, next) => {

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

export const forgotPassword = async (req, res, next) => {

    const {email} = req.body;

    if(!email) {
        return next(new AppError('email is required',500))
    }
    const user = await user.findOne({email})

    if(!user) {
        return next(new AppError('emial is not registred',500))
    }

    const resetToken = await user.generatePasswordToken()

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = `Reset Password`;
    const message =`you can reset your password <a href=${resetPasswordUrl} target ="_blank" >Reset yuor password</a>`;

    try {
        // TODo
        await sendEmail(email, subject, message);

        res
        .status(200)
        .json({
            success:true,
            message:`reset password token has been sent to ${email} sucesfully`
        })

        
    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message,500))
    }

}

export const resetPassword = async (req, res, next) => {
    const {resetToken} = req.params;

    const {password} = req.body;

    const forgotPAsswordToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })

    if(!user) {
        return next(new AppError('Token is invlaid or expired , please try again',400))
    }

    user.password = password;
    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;

    await user.save();

    res.status(200).json({
        success:true,
        message:'Password reset sucessfull'
    })

}

export const changePassword = async function(req,res,next) {
    const {oldPassword,newPassword} = req.body;
    const {id} = req.user;
    if(!oldPassword||!newPassword) {
        return next(new AppError('All fields are mandatory',400))
    }

    const user = await User.findById(id).select('+password');

    if(!user) {
        return next(new AppError('User doesnot exist',400))
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) {
        return next(new AppError('Invalid old password'))
    }

    user.password=newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success:true,
        message:'Password changed succesfully'
    })


}

export const updateUser = async function(req,res,next) {
    const {fullName } = req.body;
    const {id} = req.user;
    const user = User.findById(id);
    if(!user) return next(new AppError('USer not found',400))

    if(fullName) {
        user.fullName = fullName;
    }

    if(req.file) {
        

        try {

            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

            const avatar = await cloudinary.v2.uploader(req.file.path ,{
                floder: 'lms',
                width: 250,
                height:250,
                gravity: 'faces', // get image size reduce
                crop:'fill'
            })

            if(avatar) {
                user.avatar.public_id = avatar.public_id;
                user.avatar.secure_url = avatar.secure_url
            }

            // remove file from local server
            fs.rm(`uploads/${req.file.filename}`)
            
        } catch (error) {
           return next(new AppError(error.message || 'File not uploaded to cloud , please try again', 500)) 
        }

    }
    await user.save();

    res.status(200).json({
        success:true,
        message:'Profile Updated succesfully..'
    })
}
