import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RateLimit extends Document {
  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true, default: 1 })
  attempts: number;

  @Prop({ required: true, index: true })
  expiresAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);

// TTL index
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
