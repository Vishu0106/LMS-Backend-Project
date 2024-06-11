import Course from "../models/course.model.js"
import AppError from "../utils/appError.js"
import fs from 'fs'
import cloudinary from 'cloudinary'

export const getAllCourses = async (req,res,next) => {

    try {

        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success:true,
            message:'All courses',
            courses, // ES6 Features
        })        
    } catch (error) {

        return next(new AppError(error.message,500))
        
    }

}

export const getLecturesByCourseId = async (req,res,next)=>{

    try {

        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course) {
            return next(new AppError('No coures found with given Id ',400))
        }

        res.status(200).json({
            success:true,
            message:'course lectures fetched successfully',
            lectures:course.lectures
        })

        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

}

export const createCourse = async(req,res,next) =>{
    try {
        const {title,description,category,createdBy} = req.body
        if(!title||!description||!category||!createdBy) {
            return next(new AppError('all feileds requied to create course',400))
        }

       const course = await Course.create({
          title,
          description,
          category,
          createdBy,
          thumbnail:{
            public_id:'dummy',
            secure_url:'dummy'
          }
       }) 

       if(req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            floder:'lms'
        });
        if(result) {
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url=result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`,(err)=>{
            if(err) {
                console.log(err);
            }
        });

       }

       await course.save();

       res.status(200).json({
        success:true,
        message:'Course created successfully',
        course
       })

    } catch (e) {
        return next(new AppError(e.message,500))
    }
}

export const updateCourse = async(req,res,next) =>{
    try {
        const {courseId} = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set:req.body
            },
            {
                runValidators:true
            }
        )
        if(!course) {
            return next(new AppError('Course doesnt exists with given id',400))
        }
        res.status(200).json({
            success:true,
            message:'Course updated succesfully',
            course
        })
    } catch (e) {
        return next(new AppError(e.message,500))
    }

}

export const deleteCourse = async(req,res,next) =>{

    try {

        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course) {
            return next(new AppError('Course doext not exits with given id',400))
        }

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success:true,
            message:'Course deleted succesfylly',

        })
        
    } catch (e) {

        return next(new AppError(e.message,500))
        
    }
    
}

export const removeLectureFromCourse = async (req, res, next) => {
    // Grabbing the courseId and lectureId from req.params
    const { courseId, lectureId } = req.params;

    // Checking if both courseId and lectureId are present
    if (!courseId) {
        return next(new AppError('Course ID is required', 400));
    }

    if (!lectureId) {
        return next(new AppError('Lecture ID is required', 400));
    }

    // Find the course using the courseId
    const course = await Course.findById(courseId);

    // If no course send custom message
    if (!course) {
        return next(new AppError('Invalid ID or Course does not exist.', 404));
    }

    // Find the index of the lecture using the lectureId
    const lectureIndex = course.lectures.findIndex(
        (lecture) => lecture._id.toString() === lectureId.toString()
    );

    // If returned index is -1 then send error as mentioned below
    if (lectureIndex === -1) {
        return next(new AppError('Lecture does not exist.', 404));
    }

    // Delete the lecture from cloudinary
    await cloudinary.v2.uploader.destroy(
        course.lectures[lectureIndex].lecture.public_id,
        {
            resource_type: 'video',
        }
    );

    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);

    // update the number of lectures based on lectres array length
    course.numberOfLectures = course.lectures.length;

    // Save the course object
    await course.save();

    // Return response
    res.status(200).json({
        success: true,
        message: 'Course lecture removed successfully',
    });
};


export const addLecturesToCourseById = async (req,res,next) => {
try {
        const {title,description} = req.body;
        const {courseId} = req.params;
    
        if(!title||!description){
            return next(new AppError('All feilds are requied',400))
        }
    
        const course = await Course.findById(courseId);
    
        if(!course) {
            return next(new AppError('Course doest exists with given Id'))
        }
    
        const lectureData = {
            title,
            description,
            lecture:{}
        }
    
        if(req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                floder:'lms',
                chunk_size:5000000,
                resource_type:'video',
            })
    
            if(result) {
                lectureData.lecture.public_id = result.public_id
                lectureData.lecture.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`,(error)=>{
                if(error) {
                    console.log('Error:',error)
                }
            });
        }
        course.lectures.push(lectureData)
    
           course.numberOfLectures=course.lectures.length;
    
           await course.save();
    
            res.status(200).json({
                success:true,
                message:'Lecture added successfully',
                course
            })       
} catch (e) {
    return next(new AppError(e.message,500))
}



}