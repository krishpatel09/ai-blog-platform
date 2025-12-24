// import {
//     ExceptionFilter,
//     Catch,
//     ArgumentsHost,
//     HttpStatus,
//   } from '@nestjs/common';
//   import { Prisma } from '@prisma/client';
//   import { Request, Response } from 'express';
//   @Catch(Prisma.PrismaClientKnownRequestError)
//   export class PrismaExceptionFilter implements ExceptionFilter {
//     catch(
//       exception: Prisma.PrismaClientKnownRequestError,
//       host: ArgumentsHost,
//     ) {
//       const ctx = host.switchToHttp();
//       const response = ctx.getResponse<Response>();
//       const request = ctx.getRequest<Request>();
//       let message = 'Database error';
//       let statusCode = HttpStatus.BAD_REQUEST;
//       switch (exception.code) {
//         case 'P2002':
//           message = `Duplicate value for field: ${exception.meta?.target}`;
//           statusCode = HttpStatus.CONFLICT;
//           break;
//         case 'P2025':
//           message = 'Record not found';
//           statusCode = HttpStatus.NOT_FOUND;
//           break;
//         case 'P2003':
//           message = 'Invalid foreign key reference';
//           statusCode = HttpStatus.BAD_REQUEST;
//           break;
//         default:
//           message = 'Unexpected database error';
//           statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
//       }
//       response.status(statusCode).json({
//         success: false,
//         statusCode,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//         message,
//       });
//     }
//   }

//   ✅ Handles Prisma errors like
// //   | Prisma Code | Meaning                  |
// // | ----------- | ------------------------ |
// // | P2002       | Unique constraint failed |
// // | P2025       | Record not found         |
// // | P2003       | Foreign key error        |
