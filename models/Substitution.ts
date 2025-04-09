import mongoose, { Schema } from "mongoose"

export interface ISubstitution {
  _id: string
  date: Date
  absentTrainerId: mongoose.Types.ObjectId
  substituteTrainerId: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SubstitutionSchema = new Schema<ISubstitution>(
  {
    date: { type: Date, required: true },
    absentTrainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    substituteTrainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
)

export default mongoose.models.Substitution || mongoose.model<ISubstitution>("Substitution", SubstitutionSchema)
