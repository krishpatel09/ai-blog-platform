import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import ImageKit from 'imagekit';
import imagekitConfig from '../config/imagekit.config';

@Injectable()
export class ImageKitService {
  private readonly imagekit: ImageKit;
  private readonly logger = new Logger(ImageKitService.name);

  constructor(
    @Inject(imagekitConfig.KEY)
    private config: ConfigType<typeof imagekitConfig>,
  ) {
    this.imagekit = new ImageKit({
      publicKey: this.config.publicKey!,
      privateKey: this.config.privateKey!,
      urlEndpoint: this.config.urlEndpoint!,
    });
  }

  getAuthenticationParameters() {
    return this.imagekit.getAuthenticationParameters();
  }
}
