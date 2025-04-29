import jwt from 'jsonwebtoken';
import config from '../config/env';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: jwt.JwtPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming the token is sent in the format "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, config.JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (decoded && typeof decoded === 'object') {
            req.user = { id: decoded.id, role: decoded.role } as jwt.JwtPayload; // Save the decoded user info to the request object
        }
        return next(); // Explicitly return next() to ensure all code paths return a value
    });
};  