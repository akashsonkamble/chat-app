import { NextFunction, Request, Response } from "express";
import { ENV_MODE } from "..";

interface IError extends Error {
    statusCode?: number;
    code?: number;
    keyPattern?: Object;
    path?: string;
    errors?: { path: string; message: string }[];
}

const errorMiddleware = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    if (err.code === 11000 && err.keyPattern) {
        const error = Object.keys(err.keyPattern)[0];

        err.message = `Duplicate field - ${error}`;
        err.statusCode = 400;
    }

    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        new Error(message);
        err.statusCode = 404;
    }

    const errorResponse = {
        success: false,
        message: err.message,
        error: err,
    };

    if (ENV_MODE === "development") {
        errorResponse.error = err;
    }

    return res.status(err.statusCode).json(errorResponse);
};
export default errorMiddleware;

//middleware function for handling errors
