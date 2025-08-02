import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Article } from './article.schema';

export type SummaryDocument = Summary & Document;

@Schema({
  timestamps: true,
})
export class Summary {
  @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
  article: Article;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 0 })
  readCount: number;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);

// Tam metin arama için text index oluştur
SummarySchema.index({ text: 'text', keywords: 'text' }, { name: 'text_search_index' });

// Performans indexleri
SummarySchema.index({ article: 1 }, { name: 'article_index' });
SummarySchema.index({ createdAt: -1 }, { name: 'created_date_index' });
SummarySchema.index({ readCount: -1 }, { name: 'read_count_index' });
SummarySchema.index({ keywords: 1 }, { name: 'keywords_index' });

// Compound indexler
SummarySchema.index({ article: 1, createdAt: -1 }, { name: 'article_date_index' });
SummarySchema.index({ keywords: 1, createdAt: -1 }, { name: 'keywords_date_index' });