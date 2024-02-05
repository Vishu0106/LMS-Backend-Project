import { Router } from "express";
import { addLecturesToCourseById, createCourse, deleteCourse, getAllCourses, getLecturesByCourseId, updateCourse } from "../controllers/course.contoller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js ";

const router = Router()

// router.get('/',getAllCourses);
// router.post('/',postCourses);

router
    .route('/')
    .get(getAllCourses)
    .post(isLoggedIn, upload.single('thumbnail'), createCourse);

router
    .route('/:courseId')
    .get(isLoggedIn, getLecturesByCourseId)
    .put(isLoggedIn,authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn,authorizedRoles('ADMIN'), deleteCourse)
    .post(isLoggedIn,authorizedRoles('ADMIN'),upload.single('lecture'),addLecturesToCourseById);


export default router