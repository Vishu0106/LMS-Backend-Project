import AppError from '../utils/appError.js';
import { sendEmail } from '../utils/sendEmail.js';
import {User } from '../models/user.model.js';

export const contactUs = async (req, res, next) => {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(new AppError('Name, Email, Message are required'));
    }
  
    try {
      const subject = 'Contact Us Form';
      const textMessage = `${name} - ${email} <br /> ${message}`;
  
      await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);
    } catch (error) {
      console.log(error);
      return next(new AppError(error.message, 400));
    }
  
    res.status(200).json({
      success: true,
      message: 'Your request has been submitted successfully',
    });
  };

export const userStats = async (req, res, next) => {
    const allUsersCount = await User.countDocuments();

    const subscribersCount = await User.countDocuments({ 'subscription.status': 'active' });

    res.status(200).json({
        success: true,
        message: 'All registered users and subscribers count',
        allUsersCount,
        subscribersCount,
    });
}