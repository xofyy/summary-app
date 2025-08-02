import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SourceDocument = Source & Document;

@Schema({
  timestamps: true,
})
export class Source {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  rssFeedUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User',
    default: null
  })
  createdBy?: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isDefault: boolean;
}

export const SourceSchema = SchemaFactory.createForClass(Source);