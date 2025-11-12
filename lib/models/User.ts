import mongoose, { Schema, Model } from 'mongoose'
import { User } from '@/types'

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['master', 'admin', 'user'],
      default: 'user',
    },
    isApproved: {
      type: Boolean,
      default: false, // 관리자 승인 필요
    },
  },
  {
    timestamps: true,
    collection: 'work_users', // 기존 나라똔과 분리
  }
)

// 인덱스
UserSchema.index({ email: 1 })
UserSchema.index({ isApproved: 1 })

const UserModel: Model<User> =
  mongoose.models.WorkUser || mongoose.model<User>('WorkUser', UserSchema)

export default UserModel
