import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let message = 'Database error';
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        // Prisma Error Codes 
        switch (exception.code) {
            case 'P2002': // Unique constraint failed
                const target = (exception.meta?.target as string[]) || ['field'];
                message = `Duplicate value for field: ${target.join(', ')}`;
                statusCode = HttpStatus.CONFLICT;
                break;
            case 'P2025': // Record not found
                message = 'The requested record was not found';
                statusCode = HttpStatus.NOT_FOUND;
                break;
            case 'P2003': // Foreign key constraint failed
                message = 'Invalid reference to a related record';
                statusCode = HttpStatus.BAD_REQUEST;
                break;
            default:
                message = `Database error: ${exception.code}`;
        }

        response.status(statusCode).json({
            success: false,
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}