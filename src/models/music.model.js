import mongoose, { Schema } from "mongoose";

const musicSchema = new Schema(
  {
    song_name: {
      type: String,
      required: true,
    },
    singer: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    chat_id: {
      type: String,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

export const Music = mongoose.model("Music", musicSchema);
