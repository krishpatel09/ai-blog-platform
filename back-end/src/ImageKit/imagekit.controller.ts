import { Controller, Get } from '@nestjs/common';
import { ImageKitService } from './imagekit.service';

@Controller('imagekit')
export class ImageKitController {
  constructor(private readonly imageKitService: ImageKitService) {}

  @Get('auth')
  getAuth() {
    const authParams = this.imageKitService.getAuthenticationParameters();
    console.log('Backend: Generated ImageKit Auth Params:', authParams);
    // CHECK: Ensure 'token', 'expire', and 'signature' are present and not undefined.
    return authParams;
  }
}
