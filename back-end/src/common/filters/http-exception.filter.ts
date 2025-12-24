// import {
// ExceptionFilter,
// Catch,
// ArgumentsHost,
// HttpException,
// HttpStatus,
// } from '@nestjs/common';
// import { Request, Response } from 'express';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse<Response>();
//         const request = ctx.getRequest<Request>();

//         const status =
//             exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

//         const exceptionResponse = exception.getResponse();

//         const message =
//             typeof exceptionResponse === 'string'
//                 ? exceptionResponse
//                 : (exceptionResponse as any).message || 'Unexpected error';

//         response.status(status).json({
//             success: false,
//             statusCode: status,
//             timestamp: new Date().toISOString(),
//             path: request.url,
//             message,
//         });
//     }
// }

// // What it does

// // Catches all HttpExceptions

// // Standardizes API error response

// // Prevents ugly NestJS default errors
