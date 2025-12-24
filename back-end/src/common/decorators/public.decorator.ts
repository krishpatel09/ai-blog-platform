import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ✅ Use case
// @Public()
// @Post('login')
// login() {
//   return 'Login successful';
// }
