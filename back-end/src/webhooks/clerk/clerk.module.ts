import { Module } from '@nestjs/common';
import { ClerkWebhookController } from './clerk.controller';
import { ClerkWebhookService } from './clerk.service';
import { PrismaModule } from '../../prisma/prisma.module';


@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [ClerkWebhookController],
    providers: [ClerkWebhookService],
})
export class ClerkWebhookModule { }
