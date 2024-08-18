import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  { user_name: String, user_id: String, avatar: String, chat_id: String, socket_id: String },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
