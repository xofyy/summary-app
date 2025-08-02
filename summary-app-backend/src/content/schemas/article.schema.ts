import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Source } from './source.schema';

export type ArticleDocument = Article & Document;

@Schema({
  timestamps: true,
})
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'Source', required: true })
  source: Source;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  isSummarized: boolean;

  @Prop()
  originalContent?: string;

  @Prop()
  publishedAt?: Date;

  @Prop()
  description?: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

// Tam metin arama için text index oluştur
ArticleSchema.index({ 
  title: 'text', 
  description: 'text', 
  originalContent: 'text',
  categories: 'text'
}, { name: 'article_search_index' });

// Performans indexleri
ArticleSchema.index({ url: 1 }, { unique: true, name: 'url_unique_index' });
ArticleSchema.index({ source: 1 }, { name: 'source_index' });
ArticleSchema.index({ isSummarized: 1 }, { name: 'summarized_index' });
ArticleSchema.index({ publishedAt: -1 }, { name: 'published_date_index' });
ArticleSchema.index({ categories: 1 }, { name: 'categories_index' });

// Compound indexler
ArticleSchema.index({ source: 1, publishedAt: -1 }, { name: 'source_date_index' });
ArticleSchema.index({ isSummarized: 1, publishedAt: -1 }, { name: 'summarized_date_index' });
ArticleSchema.index({ categories: 1, isSummarized: 1 }, { name: 'categories_summarized_index' });