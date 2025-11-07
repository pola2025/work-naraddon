import mongoose, { Schema, Model } from 'mongoose'
import { BlogPost, Ranking } from '@/types'

const RankingSchema = new Schema<Ranking>(
  {
    rank: {
      type: Number,
      required: true,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
    },
    checkedBy: {
      type: String,
      required: true,
    },
  },
  { _id: true }
)

const BlogPostSchema = new Schema<BlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    rankings: [RankingSchema],
    author: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'work_blog_posts',
  }
)

// 인덱스
BlogPostSchema.index({ keyword: 1 })
BlogPostSchema.index({ author: 1 })
BlogPostSchema.index({ createdAt: -1 })

const BlogPostModel: Model<BlogPost> =
  mongoose.models.WorkBlogPost || mongoose.model<BlogPost>('WorkBlogPost', BlogPostSchema)

export default BlogPostModel
