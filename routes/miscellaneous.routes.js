import { Router } from 'express';
import { contactUs } from '../controllers/miscellaneous.controller.js';


const router = Router();


router.route('/contactus').post(contactUs);


export default router;