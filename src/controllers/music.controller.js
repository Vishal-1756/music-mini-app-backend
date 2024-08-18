import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fetchSong from "../utils/ytdl.js";
import { io } from "../app/index.js";
import { Music } from "../models/music.model.js";

const searchYt = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const jsonData = await fetchSong(q);
  res.json(new ApiResponse(200, jsonData));
});

const playSong = asyncHandler(async (req, res) => {
  const { q, chat_id } = req.query;

  const { singer, song_name, url, image } = await fetchSong(q);

  
  const song = new Music({
    singer,
    song_name,
    url,
    image,
    chat_id,
  });
  
  await song.save();
  
  io.sockets.in(chat_id).emit("update_song", { chat_id });
  return res.json(new ApiResponse(200, {}, `Song ${song_name} playing`));
});

const getCurrentSongs = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;

  let songs = await Music.find({ chat_id });
  if (!songs) {
    songs = [];
  }

  res.json(new ApiResponse(200, songs));
});

const pauseSong = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;
  const songs = await Music.find({ chat_id });
  if (!songs) {
    throw new ApiError(404, "No songs found");
  }
  const currentSong = songs[0];
  if (currentSong.isPlaying === false) {
    return res.json(new ApiResponse(200, {}, `Song "${currentSong.song_name}" is already paused`));
  }

  currentSong.isPlaying = false;
  await currentSong.save();
  io.sockets.in(chat_id).emit("toggle_song", { chat_id, to: "pause" });

  return res.json(new ApiResponse(200, {}, `Song "${currentSong.song_name}" has been paused`));
})

const resumeSong = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;
  const songs = await Music.find({ chat_id });
  if (!songs) {
    throw new ApiError(404, "No songs found");
  }
  const currentSong = songs[0];
  if (currentSong.isPlaying === true) {
    return res.json(new ApiResponse(200, {}, `Song "${currentSong.song_name}" is already playing`));
  }

  currentSong.isPlaying = true;
  await currentSong.save();
  io.sockets.in(chat_id).emit("toggle_song", { chat_id, to: "resume" })

  return res.json(new ApiResponse(200, {}, `Song "${currentSong.song_name}" has been playing`));
})

const skipSong = asyncHandler(async (req ,res ) => {
  const { chat_id } = req.query;
  const songs = await Music.find({ chat_id });
  const currentSong = songs[0];
  if (!currentSong) {
    throw new ApiError(404, "No songs found");
  }

  const song_name = currentSong.song_name;

  await Music.findByIdAndDelete(currentSong._id);
  io.sockets.in(chat_id).emit("update_song", { chat_id });

  return res.json(new ApiResponse(200, {}, `Song "${song_name}" has been skipped`));
})

const endSong = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;
  const songs = await Music.find({ chat_id });
  if (!songs) {
    throw new ApiError(404, "No songs playing in the chat room");
  }

  await Music.deleteMany({ chat_id });

  io.sockets.in(chat_id).emit("update_song", { chat_id });
  return res.json(new ApiResponse(200, {}, "Song has been ended"));
})

export { searchYt, playSong, getCurrentSongs, pauseSong, resumeSong, skipSong, endSong };
