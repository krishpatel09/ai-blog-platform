import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BlacklistedToken extends Document {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop()
  reason?: string;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);

// TTL index (auto delete after expiry)
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
