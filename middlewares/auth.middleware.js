import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const isLoggedIn = function(req, res, next) {
    const {token} = req.cookies;

    if(!token) {
        return next(new AppError('unauthenticated person',400))
    }

    const tokenDetails = jwt.verify(token,process.env.JWT_SECRET);

    if(!tokenDetails) {
        return next(new AppError('unauthenticaed , please login ',401))
    }

    req.user = tokenDetails;

    next();

}

const authorizedRoles = (...roles) => (req,res,next) => {

const currentRole = req.user.role;
if(!roles.includes(currentRole)) {
   return next(new AppError('You are not authoried Person to do this',403))
}
   next();
}

const authorizedSubscriber = async(req,res,next) =>{
  
    const subscriptionStatus = req.user.subscription.status;
    const currentRole = req.user.role;
    console.log(subscriptionStatus,'subscriptionStatus');
    if(currentRole !== 'ADMIN' && subscriptionStatus !== 'active') {
        return next(new AppError('Please subscribe to acees the course..',403))
    }
    next();

}

export {isLoggedIn,authorizedRoles,authorizedSubscriber}