import jwt from 'jsonwebtoken';
import config from '../config/env';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../utils/http-status.enum';
import User from '../models/user.model';
import { UserStatus } from '../utils/user-status.enum';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const createRoleAuthMiddleware = (allowedRoles?: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log("middleware working");

        if (!token) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'No token provided',
                status: HttpStatus.UNAUTHORIZED
            });
            return;
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;

            const user = await User.findById(decoded.id);
            if (!user) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found',
                    status: HttpStatus.UNAUTHORIZED
                });
                return;
            }

            if (user.status === UserStatus.BLOCKED || user.status === UserStatus.PENDING) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User is blocked',
                    status: HttpStatus.UNAUTHORIZED,
                });
                return;
            }

            req.user = {
                id: decoded.id,
                role: decoded.role  // Assuming decoded.role comes from JWT; fallback to user.role if needed
            };

       
            if (allowedRoles && !allowedRoles.includes(req.user.role)) {
                console.warn(`Role denied for user ${req.user.id}: ${req.user.role} not in [${allowedRoles.join(', ')}]`);
                res.status(HttpStatus.FORBIDDEN).json({
                    success: false,
                    message: 'Insufficient permissions for this action',
                    status: HttpStatus.FORBIDDEN
                });
                return;
            }

            next();
        } catch (err) {
            console.error('JWT verification error:', err);
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Token expired or invalid',
                status: HttpStatus.UNAUTHORIZED
            });
        }
    };
};

// Backward-compatible alias: For global use without roles (skips check)
export const authMiddleware = createRoleAuthMiddleware;  


