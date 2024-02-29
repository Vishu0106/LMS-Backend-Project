import { Router } from "express";
import { addLecturesToCourseById, createCourse, deleteCourse, getAllCourses, getLecturesByCourseId, updateCourse , removeLectureFromCourse} from "../controllers/course.contoller.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middlewares/auth.middleware.js";
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
    .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
    .put(isLoggedIn,authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn,authorizedRoles('ADMIN'), deleteCourse)
    .post(isLoggedIn,authorizedRoles('ADMIN'),upload.single('lecture'),addLecturesToCourseById);
router
    .route('/remove-lecture/:courseId/:lectureId')
    .delete(isLoggedIn,authorizedRoles('ADMIN'),removeLectureFromCourse)

export default router