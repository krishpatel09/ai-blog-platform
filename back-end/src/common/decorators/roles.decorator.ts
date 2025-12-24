import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'admin' | 'user';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// ✅ Use case
// @Roles('admin')
// @Post('create-post')
// createPost() {
//   return 'Post created successfully';
// }

// @Roles('admin')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Get('admin')
// adminOnly() {}
