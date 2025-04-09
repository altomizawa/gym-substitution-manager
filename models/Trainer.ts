import mongoose, { Schema } from "mongoose"

export interface ITrainer {
  _id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const TrainerSchema = new Schema<ITrainer>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export default mongoose.models.Trainer || mongoose.model<ITrainer>("Trainer", TrainerSchema)
