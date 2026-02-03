import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientIp } from '../common/decorators/ip.decorator';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Public } from '../common/decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CookieInterceptor } from '../common/interceptors/cookie.interceptor';

@Controller('auth')
@UseInterceptors(CookieInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

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
  ) {
    return this.authService.signin(dto, ip, userAgent);
  }

  @Post('logout')
  async logout(
    @Req() req: any,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.logout(
      req.user?.id,
      req.cookies?.refreshToken,
      ip,
      userAgent,
    );
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refresh(@Req() req: any) {
    const dto: RefreshTokenDto = {
      refreshToken: req.user.refreshToken,
    };
    console.log('Backend: Refreshing token for user:', req.user.id);
    return this.authService.refreshToken(dto);
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
  async resendVerification(
    @Body() dto: ResendVerificationDto,
    @ClientIp() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.resendVerificationEmail(
      dto.email,
      ipAddress,
      userAgent,
    );
  }
}
