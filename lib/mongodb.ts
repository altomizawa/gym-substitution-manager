import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gym-substitution-manager"

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
  const connection = await mongoose.connect(MONGODB_URI, {
    dbName: "gym-substitution-manager",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("Connected to MongoDB")
}

export default connectToDatabase
