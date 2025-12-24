import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 second
      limit: parseInt(process.env.THROTTLE_LIMIT || '3', 10),
    },
    {
      name: 'medium',
      ttl: 60_000, // 1 minute
      limit: parseInt(process.env.THROTTLE_LIMIT || '20', 10),
    },
    {
      name: 'long',
      ttl: 900_000, // 15 minutes
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
  ],
};
