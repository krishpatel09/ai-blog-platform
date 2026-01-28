import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ClerkWebhookService } from './clerk.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(private readonly clerkWebhookService: ClerkWebhookService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    const startTime = Date.now();
    const rawBody = req.rawBody?.toString('utf-8') || '';
    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    this.logger.log(`[Webhook] Received request - ID: ${svixId}`);

    await this.clerkWebhookService.handleWebhook(
      rawBody,
      svixId,
      svixTimestamp,
      svixSignature,
    );

    const duration = Date.now() - startTime;
    this.logger.log(
      `[Webhook] Processed successfully in ${duration}ms - ID: ${svixId}`,
    );

    return { success: true };
  }
}
