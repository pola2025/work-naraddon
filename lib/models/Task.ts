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
      enum: ['requested', 'in_progress', 'review', 'completed'],
      default: 'requested',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignee: {
      type: String,
      required: true,
    },
    requester: {
      type: String,
      required: true,
    },
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
TaskSchema.index({ assignee: 1 })
TaskSchema.index({ requester: 1 })
TaskSchema.index({ dueDate: 1 })

const TaskModel: Model<Task> =
  mongoose.models.WorkTask || mongoose.model<Task>('WorkTask', TaskSchema)

export default TaskModel
