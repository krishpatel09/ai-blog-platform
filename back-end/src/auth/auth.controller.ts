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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientIp } from '../common/decorators/ip.decorator';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Public()
  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.signup(dto, ip, userAgent);
  }

  @Public()
  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, user } = await this.authService.signin(
      dto,
      ip,
      userAgent,
    );
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken, user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies?.refreshToken as string) || '';
    const result = await this.authService.logout(refreshToken, ip, userAgent);
    res.clearCookie('refreshToken');
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, user } =
      await this.authService.refreshToken(dto, ip, userAgent);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken, user };
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

  @Post('resend-verification')
  async resendVerification(
    @Body() dto: ResendVerificationDto,
    @ClientIp() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.resendVerificationEmail(dto.email, ipAddress, userAgent);
  }
}
