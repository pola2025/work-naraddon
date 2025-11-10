import mongoose, { Schema, Model } from 'mongoose'
import { Task, Comment } from '@/types'

const CommentSchema = new Schema<Comment>(
  {
    author: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const TaskSchema = new Schema<Task>(
  {
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['preparing', 'in_progress', 'completed'],
      default: 'preparing',
    },
    url: {
      type: String,
      default: '',
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dueDate: {
      type: Date,
    },
    comments: [CommentSchema],
  },
  {
    timestamps: true,
    collection: 'work_tasks',
  }
)

// 인덱스
TaskSchema.index({ status: 1 })
TaskSchema.index({ dueDate: 1 })

const TaskModel: Model<Task> =
  mongoose.models.WorkTask || mongoose.model<Task>('WorkTask', TaskSchema)

export default TaskModel
