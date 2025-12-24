import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SessionCache extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: number;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ required: true, index: true })
  expiresAt: Date;
}

export const SessionCacheSchema = SchemaFactory.createForClass(SessionCache);

// TTL index
SessionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
