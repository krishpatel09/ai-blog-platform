import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface RequestWithUser {
  user?: User;
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

/**
 * JwtGuard - Route protection guard that verifies JWT tokens
 *
 * This guard implements NestJS CanActivate interface to protect routes
 * It runs before route handlers to verify authentication
 *
 * Process:
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies token with Supabase Auth API
 * 3. If valid, attaches user object to request and allows access
 * 4. If invalid, throws UnauthorizedException and blocks access
 *
 * Usage:
 * Apply to routes using @UseGuards(JwtGuard) decorator
 * Example: @Get('me') @UseGuards(JwtGuard) async getMe(...)
 */
@Injectable()
export class JwtGuard implements CanActivate {
  // Private Supabase client instance - initialized in constructor
  // This client is configured with service role key for token verification
  private supabase: SupabaseClient;

  /**
   * Constructor - Initializes JwtGuard with Supabase client
   *
   * Dependencies injected by NestJS:
   * - ConfigService: Access to environment variables
   *
   * During construction:
   * 1. Retrieves Supabase configuration from environment variables
   * 2. Validates that required configuration exists
   * 3. Creates Supabase client with service role key
   */
  constructor(private configService: ConfigService) {
    // Get Supabase project URL from environment variables
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

    // Get Supabase service role key from environment variables
    // Service role key is needed to verify tokens server-side
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    // Validate that both required configuration values are present
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    // Create Supabase client instance with URL and service role key
    // This client will be used to verify JWT tokens
    this.supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
    ) as SupabaseClient;
  }

  /**
   * canActivate - Main guard method that runs before route handler
   *
   * This method is called by NestJS for every request to protected routes
   *
   * Process:
   * 1. Extract HTTP request from execution context
   * 2. Get Authorization header from request
   * 3. Validate header format (must start with "Bearer ")
   * 4. Extract JWT token from header
   * 5. Verify token with Supabase Auth API
   * 6. If valid, attach user to request object and return true
   * 7. If invalid, throw UnauthorizedException
   *
   * @param context - NestJS execution context containing request/response objects
   * @returns true if token is valid (allows request), throws exception if invalid
   * @throws UnauthorizedException if token is missing, invalid, or expired
   *
   * After successful verification:
   * - request.user is set with user data from token
   * - Route handler can access user via @CurrentUser() decorator
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get HTTP request object from NestJS execution context
    // switchToHttp() converts the context to HTTP-specific context
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Extract Authorization header from request
    // Expected format: "Bearer <jwt_token>"
    const authHeader = request.headers?.authorization;

    // Validate Authorization header exists and has correct format
    // Must start with "Bearer " (case-sensitive, with space)
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      // HTTP 401 Unauthorized - missing or malformed authorization header
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    // Extract JWT token from Authorization header
    // Remove "Bearer " prefix (7 characters) to get just the token
    const token = authHeader.substring(7);

    try {
      // Verify JWT token with Supabase Auth API
      // getUser() validates the token signature and expiration
      // Returns user data if token is valid
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      // Validate token verification was successful
      // Must have: no error and valid user object
      if (error || !user) {
        // HTTP 401 Unauthorized - token is invalid or expired
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user object to request for use in route handler
      // This allows route handlers to access authenticated user data
      // The @CurrentUser() decorator extracts this user object
      request.user = user;

      // Return true to allow the request to proceed to route handler
      return true;
    } catch (error) {
      // If error is already an UnauthorizedException, re-throw it
      // This preserves the original error message
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // For any other errors (network, Supabase API errors, etc.)
      // Throw generic UnauthorizedException
      // This prevents leaking internal error details to client
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
