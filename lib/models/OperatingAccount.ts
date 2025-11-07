import mongoose, { Schema, Model } from 'mongoose'
import { OperatingAccount } from '@/types'

const OperatingAccountSchema = new Schema<OperatingAccount>(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    lastUsedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'work_operating_accounts',
  }
)

// 인덱스
OperatingAccountSchema.index({ platform: 1 })
OperatingAccountSchema.index({ lastUsedAt: -1 })

const OperatingAccountModel: Model<OperatingAccount> =
  mongoose.models.WorkOperatingAccount ||
  mongoose.model<OperatingAccount>('WorkOperatingAccount', OperatingAccountSchema)

export default OperatingAccountModel
