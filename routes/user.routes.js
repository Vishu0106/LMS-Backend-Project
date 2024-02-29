import  express  from "express";
const router = express.Router();
import { register , login , logout ,getProfile, forgotPassword, changePassword, updateUser, resetPassword } from "../controllers/user.contoller.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"


router.post('/register',upload.single('avatar'),register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me',isLoggedIn,getProfile);
router.post('/reset',forgotPassword);
router.post('/reset/:resetToken',resetPassword);
router.post('/change-password',isLoggedIn,changePassword)
router.put('/update/', isLoggedIn, upload.single('avatar'),updateUser)


export default router;