import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import config from '../config/env';
import User from '../models/user.model';
import { HttpStatus } from '../utils/http-status.enum';
import { UserStatus } from '../utils/user-status.enum';


interface JwtPayload {
  id: string;
  role: string;
}

interface SocketAuthError extends Error {
  status: number;
  data: {
    success: boolean;
    message: string;
    status: number;
  };
}

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token?.split(' ')[1];
    if (!token) {
      const error: SocketAuthError = new Error('No token provided') as SocketAuthError;
      error.status = HttpStatus.UNAUTHORIZED;
      error.data = {
        success: false,
        message: 'No token provided',
        status: HttpStatus.UNAUTHORIZED,
      };
      return next(error);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      const error: SocketAuthError = new Error('User not found') as SocketAuthError;
      error.status = HttpStatus.UNAUTHORIZED;
      error.data = {
        success: false,
        message: 'User not found',
        status: HttpStatus.UNAUTHORIZED,
      };
      return next(error);
    }

    // if (user.status === 'blocked' || user.status === 'pending') 
    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.PENDING)  {
      const error: SocketAuthError = new Error('User is blocked or pending') as SocketAuthError;
      error.status = HttpStatus.UNAUTHORIZED;
      error.data = {
        success: false,
        message: 'User is blocked or pending',
        status: HttpStatus.UNAUTHORIZED,
      };
      return next(error);
    }

    // Attach user data to socket
    socket.data.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error('Socket.IO auth error:', err);
    const error: SocketAuthError = new Error('Token expired or invalid') as SocketAuthError;
    error.status = HttpStatus.UNAUTHORIZED;
    error.data = {
      success: false,
      message: 'Token expired or invalid',
      status: HttpStatus.UNAUTHORIZED,
    };
    return next(error);
  }
};