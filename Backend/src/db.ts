// src/db.ts
import mongoose, { Schema, model } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ayurtrack";

mongoose.connect(MONGO)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// User schema & model
const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

export const userModel = model("User", userSchema);
