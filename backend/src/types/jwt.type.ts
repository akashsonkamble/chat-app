import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IRequest extends Request {
    user: JwtPayload;
    cookies: {
        jwt: string;
    };
}
