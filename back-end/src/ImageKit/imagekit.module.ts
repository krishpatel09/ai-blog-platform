import { Module } from '@nestjs/common';
import { ImageKitController } from './imagekit.controller';
import { ImageKitService } from './imagekit.service';
import imagekitConfig from '../config/imagekit.config';

@Module({
  controllers: [ImageKitController],
  providers: [ImageKitService],
  exports: [ImageKitService],
})
export class ImageKitModule {}
