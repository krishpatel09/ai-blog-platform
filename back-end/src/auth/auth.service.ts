import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient<any, 'public', any>;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
    ) as SupabaseClient<any, 'public', any>;
  }

  async signup(signupDto: SignupDto) {
    const { username, email, password } = signupDto;

    // Check if user already exists
    const { data: users, error: listUsersError } =
      await this.supabase.auth.admin.listUsers();
    if (listUsersError) {
      throw new Error('Failed to list users');
    }
    const existingUser = users.users.find((user) => user.email === email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user in Supabase Auth
    const { data: authData, error: createError } =
      await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
        },
      });

    if (createError || !authData?.user) {
      throw new Error('Failed to create user');
    }

    // User data is saved in Supabase Auth table (auth.users)
    // No need to create separate profile table - all data is in Auth

    // Sign in the user to get JWT tokens
    const { data: signInData, error: signInError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData?.user || !signInData?.session) {
      throw new Error('Failed to generate authentication tokens');
    }

    return {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    console.log(email, password, 'loginDto');

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(data, 'data');
    if (error || !data?.user || !data?.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async getCurrentUser(userId: string, accessToken: string) {
    // Verify token with Supabase to get user info from Auth table
    const { data: tokenData, error: tokenError } =
      await this.supabase.auth.getUser(accessToken);

    if (tokenError || !tokenData?.user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Get user data from Supabase Auth table (auth.users)
    // Username is stored in user_metadata during signup
    return {
      access_token: accessToken,
      user: {
        id: tokenData.user.id,
        email: tokenData.user.email || '',
        username: (tokenData.user.user_metadata?.username as string) || null,
        createdAt: tokenData.user.created_at || new Date().toISOString(),
      },
    };
  }
}
