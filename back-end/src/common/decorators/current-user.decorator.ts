// Import NestJS utilities for creating custom parameter decorators
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser - Custom parameter decorator to extract authenticated user from request
 * 
 * This decorator extracts the user object that was attached to the request by JwtGuard
 * It provides a clean way to access authenticated user data in route handlers
 * 
 * Usage:
 * @Get('me')
 * @UseGuards(JwtGuard)  // Must use JwtGuard first to attach user to request
 * async getMe(@CurrentUser() user: { id: string }) {
 *   // user object is automatically extracted from request.user
 *   return this.authService.getCurrentUser(user.id);
 * }
 * 
 * How it works:
 * 1. JwtGuard verifies JWT token and attaches user to request.user
 * 2. @CurrentUser() decorator extracts request.user
 * 3. Route handler receives user object as parameter
 * 
 * Note: This decorator only works if JwtGuard (or similar guard) has attached user to request
 * If used without a guard, request.user will be undefined
 */
export const CurrentUser = createParamDecorator(
  /**
   * Decorator factory function
   * 
   * This function is called by NestJS for each request to extract the parameter value
   * 
   * @param data - Optional data passed to decorator (not used in this implementation)
   * @param ctx - NestJS execution context containing request/response objects
   * @returns User object from request (set by JwtGuard)
   */
  (data: unknown, ctx: ExecutionContext) => {
    // Get HTTP request object from NestJS execution context
    // switchToHttp() converts the context to HTTP-specific context
    const request = ctx.switchToHttp().getRequest();
    
    // Return user object that was attached to request by JwtGuard
    // JwtGuard sets request.user after successfully verifying the JWT token
    // If no guard was used, this will be undefined
    return request.user;
  },
);



