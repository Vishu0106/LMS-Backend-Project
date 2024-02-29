import { User } from '../models/user.model.js'
import AppError from '../utils/appError.js'
import {razorpay} from '../server.js'
import Payment from '../models/payment.model.js'
import crypto from "crypto"
export const getRazorpayApiKey = async (req,res,next) =>{

    try {

        res.status(200).json({
            success:true,
            message:'Razorpay API Key',
            key:process.env.RAZORPAY_KEY_ID
        })
        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

} 

export const buySubscription = async (req,res,next) =>{

    try {
        const {id} = req.user
        const user = await User.findById(id);

        if(!user) {
            return next(new AppError('User doesnot found',400))
        }

        if(user.role==='ADMIN') {
            return next(new AppError('Admin cant buy subcription',400))
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id:process.env.RAZORPAY_PLAN_ID,
            customer_notify:1,
            total_count:12
        })

        console.log("hello",subscription);

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
        await user.save();

        res.status(200).json({
            success:true,
            message:'Subscribed successfully',
            subscription_id : subscription.id
        })
        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

} 

export const verifySubscription = async(req,res,next) =>{

    try {

        const {id} = req.user
        const user = await User.findById(id);

        if(!user) {
            return next(new AppError('User doesnot found',400))
        }
        
        const {
            razorpay_payment_id, razorpay_signature,
            razorpay_subscription_id
        } = req.body;

        const generatedSignature = crypto
        .createHmac('sha256',process.env.RAZORPAY_SECRET)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest('hex');
        
        if(generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verifed, please try again',500))
        }

        // record payment details
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        });

        // update user record with subscription status
        user.subscription.status='active'

        await user.save();

        res.status(200).json({
            success:true,
            message:'payment verified succesfully'
        })
        
        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

} 

export const cancelSubscription = async (req,res,next) =>{

    try {

        const {id} = req.user;

        const user = await User.findById(id);

        if(!user) {
            return next(new AppError('User doenot found',500))
        }

        if(user.role==='ADMIN') {
            return next(new AppError('admin cont cancel the subscription',403))
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(subscriptionId);

        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success:true,
            message:'Subscription Cancelled'
        })

        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

}

export const getAllPayments = async (req,res,next) =>{

    try {

        const {count} = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count:count||10,
        });

        res.status(200).json({
            success:true,
            message:'All Payments',
            payments:subscriptions
        })
        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

} 