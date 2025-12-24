// // (Optional but Useful)
// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const ClientIp = createParamDecorator(
//   (_data: unknown, ctx: ExecutionContext): string | undefined => {
//     const request = ctx.switchToHttp().getRequest();
//     return (
//       request.headers['x-forwarded-for'] ||
//       request.socket?.remoteAddress
//     );
//   },
// );

// @Post('login')
// login(@ClientIp() ip: string) {}
