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

export {isLoggedIn}