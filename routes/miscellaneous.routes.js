import { Router } from 'express';
import { contactUs , userStats } from '../controllers/miscellaneous.controller.js';
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middleware.js';


const router = Router();


router.route('/contactus').post(contactUs);
router
    .route('/admin/stats/users')
    .get(isLoggedIn, authorizedRoles('ADMIN'), userStats);


export default router;