import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { PrismaService } from '../../prisma/prisma.service';

interface ClerkUserData {
    id: string;
    email_addresses: Array<{
        email_address: string;
        id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    image_url: string | null;
}

interface ClerkWebhookEvent {
    type: 'user.created' | 'user.updated' | 'user.deleted';
    data: ClerkUserData;
}

@Injectable()
export class ClerkWebhookService {
    private readonly logger = new Logger(ClerkWebhookService.name);

    constructor(private readonly prisma: PrismaService) { }

    async handleWebhook(
        rawBody: string,
        svixId: string,
        svixTimestamp: string,
        svixSignature: string,
    ): Promise<void> {
        this.logger.log(`[Clerk Webhook] Received webhook - ID: ${svixId}, Timestamp: ${svixTimestamp}`);

        const event = this.verifyWebhookSignature(
            rawBody,
            svixId,
            svixTimestamp,
            svixSignature,
        );

        this.logger.log(`[Clerk Webhook] Processing event type: ${event.type} for user: ${event.data.id}`);

        switch (event.type) {
            case 'user.created':
                await this.handleUserCreated(event.data);
                break;

            case 'user.updated':
                await this.handleUserUpdated(event.data);
                break;

            case 'user.deleted':
                await this.handleUserDeleted(event.data);
                break;

            default:
                this.logger.warn(`[Clerk Webhook] Unhandled event type: ${event.type}`);
        }

        this.logger.log(`[Clerk Webhook] Successfully processed ${event.type} for user: ${event.data.id}`);
    }

    private verifyWebhookSignature(
        rawBody: string,
        svixId: string,
        svixTimestamp: string,
        svixSignature: string,
    ): ClerkWebhookEvent {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            this.logger.error('CLERK_WEBHOOK_SECRET is not configured');
            throw new InternalServerErrorException('Webhook secret not configured');
        }

        try {
            const wh = new Webhook(webhookSecret);

            const payload = wh.verify(rawBody, {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            }) as ClerkWebhookEvent;

            return payload;
        } catch (error) {
            this.logger.error('Webhook signature verification failed', error);
            throw new BadRequestException('Invalid webhook signature');
        }
    }


    private async handleUserCreated(userData: ClerkUserData): Promise<void> {
        try {
            const primaryEmail = userData.email_addresses[0]?.email_address;

            if (!primaryEmail) {
                this.logger.warn(
                    `User ${userData.id} has no email address, skipping sync`,
                );
                return;
            }
            const fullName =
                userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`.trim()
                    : userData.username || primaryEmail.split('@')[0];

            const username =
                userData.username || primaryEmail.split('@')[0] + '_clerk';

            await this.prisma.$transaction(async (tx) => {

                const user = await tx.user.upsert({
                    where: { email: primaryEmail },
                    update: {
                        clerkId: userData.id,
                        name: fullName,
                        avatar: userData.image_url,
                    },
                    create: {
                        clerkId: userData.id,
                        email: primaryEmail,
                        name: fullName,
                        username: username,
                        avatar: userData.image_url,
                        isActive: true,
                    },
                });

                const existingSecurity = await tx.userSecurity.findUnique({
                    where: { userId: user.id },
                });

                if (!existingSecurity) {
                    await tx.userSecurity.create({
                        data: {
                            userId: user.id,
                            password: '',
                            emailVerified: true,
                            emailVerificationToken: null,
                            emailVerificationExpires: null,
                        },
                    });
                } else {
                    await tx.userSecurity.update({
                        where: { userId: user.id },
                        data: {
                            emailVerified: true,
                        },
                    });
                }
                this.logger.log(
                    `Successfully synced Clerk user: ${userData.id} → DB user: ${user.id}`,
                );
            });
        } catch (error) {
            this.logger.error(
                `Failed to handle user.created event for ${userData.id}`,
                error,
            );
            throw new InternalServerErrorException('Failed to sync user');
        }
    }

    private async handleUserUpdated(userData: ClerkUserData): Promise<void> {
        try {
            const primaryEmail = userData.email_addresses[0]?.email_address;

            if (!primaryEmail) {
                this.logger.warn(
                    `User ${userData.id} has no email address, skipping update`,
                );
                return;
            }

            const fullName =
                userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`.trim()
                    : userData.username || primaryEmail.split('@')[0];

            const user = await this.prisma.user.findUnique({
                where: { clerkId: userData.id },
            });

            if (!user) {
                this.logger.warn(
                    `User with clerkId ${userData.id} not found, creating new user`,
                );
                await this.handleUserCreated(userData);
                return; ``
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email: primaryEmail,
                    name: fullName,
                    avatar: userData.image_url,
                },
            });

            this.logger.log(`Successfully updated user: ${user.id} from Clerk`);
        } catch (error) {
            this.logger.error(
                `Failed to handle user.updated event for ${userData.id}`,
                error,
            );
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    private async handleUserDeleted(userData: ClerkUserData): Promise<void> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { clerkId: userData.id },
            });

            if (!user) {
                this.logger.warn(
                    `User with clerkId ${userData.id} not found in database, skipping deletion`,
                );
                return;
            }

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    isActive: false,
                    clerkId: null,
                },
            });

            this.logger.log(
                `Successfully soft-deleted user: ${user.id} (clerkId: ${userData.id})`,
            );


            await this.prisma.refreshToken.updateMany({
                where: { userId: user.id },
                data: { isRevoked: true },
            });

            this.logger.log(
                `Revoked all refresh tokens for user: ${user.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle user.deleted event for ${userData.id}`,
                error,
            );
            throw new InternalServerErrorException('Failed to delete user');
        }
    }
}
