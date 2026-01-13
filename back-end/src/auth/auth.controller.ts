import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Req,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientIp } from '../common/decorators/ip.decorator';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CookieInterceptor } from '../common/interceptors/cookie.interceptor';

@Controller('auth')
@UseInterceptors(CookieInterceptor)
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto, @ClientIp() ip: string, @Headers('user-agent') userAgent: string) {
    return this.authService.signup(dto, ip, userAgent);
  }

  @Public()
  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.signin(dto, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.logout(req.user.id, req.cookies.refreshToken, ip, userAgent);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refreshToken(dto, ip, userAgent);
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyEmail(token, ip, userAgent);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto, @ClientIp() ipAddress: string, @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.resendVerificationEmail(dto.email, ipAddress, userAgent);
  }

  @Public()
  @Post('clerk-verify')
  async clerkVerify(
    @Body() body: { sessionId: string },
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyClerkSession(body.sessionId, ip, userAgent);
  }
}
