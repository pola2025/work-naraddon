import mongoose, { Schema, Model } from 'mongoose'
import { TaskHistory } from '@/types'

const TaskHistorySchema = new Schema<TaskHistory>(
  {
    taskId: {
      type: String,
      required: true,
      index: true, // 빠른 조회를 위한 인덱스
    },
    status: {
      type: String,
      enum: ['making', 'confirming', 'in_progress', 'completed', 'on_hold', 'cancelled'],
      default: 'in_progress',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
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
    author: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'task_histories',
  }
)

// 복합 인덱스: taskId + createdAt (시간순 조회 최적화)
TaskHistorySchema.index({ taskId: 1, createdAt: -1 })

const TaskHistoryModel: Model<TaskHistory> =
  mongoose.models.TaskHistory || mongoose.model<TaskHistory>('TaskHistory', TaskHistorySchema)

export default TaskHistoryModel
