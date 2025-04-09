import mongoose, { Schema } from "mongoose"

export interface IBalance {
  _id: string
  trainerId: mongoose.Types.ObjectId
  owesToTrainerId: mongoose.Types.ObjectId
  daysOwed: number
  createdAt: Date
  updatedAt: Date
}

const BalanceSchema = new Schema<IBalance>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    owesToTrainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    daysOwed: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
)

// Create a compound index to ensure uniqueness of trainer pairs
BalanceSchema.index({ trainerId: 1, owesToTrainerId: 1 }, { unique: true })

export default mongoose.models.Balance || mongoose.model<IBalance>("Balance", BalanceSchema)
