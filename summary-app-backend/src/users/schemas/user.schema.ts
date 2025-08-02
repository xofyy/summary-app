import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ 
    type: [{ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Source' 
    }], 
    default: [] 
  })
  customSources: MongooseSchema.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// User indexleri
UserSchema.index({ email: 1 }, { unique: true, name: 'email_unique_index' });
UserSchema.index({ interests: 1 }, { name: 'interests_index' });
UserSchema.index({ customSources: 1 }, { name: 'custom_sources_index' });
UserSchema.index({ createdAt: -1 }, { name: 'user_created_date_index' });