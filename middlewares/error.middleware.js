export const errorMiddleware = (error , req, res, next) => {



    req.statusCode = req.statusCode || 400;
    req.message = req.message || "Something went wrong";


    return res.status(req.statusCode).json(
        {
            success:false,
            message: req.message ,
            stack: error.stack
        }
    )
}