import server, { io } from "./app/index.js";
import connectDB from "./db.js";
import { User } from "./models/user.model.js";
import { Music } from "./models/music.model.js";
import axios from "axios";
import getAvatar from "./utils/getAvatar.js";

const port = process.env.PORT || 5000;
const botToken = "6463388867:AAHRm6w6sKsLq5I_h5g5i7xSE9iM4J4lsx4";
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

io.on("connection", async (socket) => {
  socket.on("disconnect", async () => {
    const user = await User.findOne({ socket_id: socket.id });
    if (!user) return;

    io.sockets.in(user.chat_id).emit("user_left_frontend", {
      chat_id: user.chat_id,
      name: user.user_name,
    });

    io.sockets.in(user.chat_id).emit("update_users", {
      chat_id: user.chat_id,
      type: "left",
      user_name: user.user_name,
    });

    await User.findByIdAndDelete(user._id);
  });

  socket.on("join", async ({ user_name, user_id, username, chat_id, socket_id }) => {
    socket.join(chat_id);
    const avatar = await getAvatar(username);
    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
      await User.findByIdAndDelete(existingUser._id);
    }

    const newUser = new User({
      user_name,
      user_id,
      username,
      avatar,
      chat_id,
      socket_id,
    });
    await newUser.save();

    io.sockets.in(chat_id).emit("user_joined", { user_name, user_id, chat_id });
    io.sockets.in(chat_id).emit("update_users", { chat_id, type: "joined", user_name });
  });

  socket.on("songEnded", async ({ _id }) => {
    const song = await Music.findById(_id);
    if (!song) {
      const remainingSongs = await Music.find({ chat_id: _id.chat_id });
      if (remainingSongs.length === 0) {
        await axios.post(telegramApiUrl, {
          chat_id: song.chat_id,
          text: "No More Song in queue, play using `/play name`",
          parse_mode: "Markdown",
        });
      }
      return;
    }

    const song_name = song.song_name;
    const singer = song.singer;
    const chat_id = song.chat_id;
    const duration = song.duration;

    await Music.findByIdAndDelete(_id);

    const buttons = [
      [
        { text: "⏮", callback_data: `previous_${chat_id}` },
        { text: "ⅠⅠ", callback_data: `resume_${chat_id}` },
        { text: "⏭", callback_data: `next_${chat_id}` },
      ],
      [
        { text: "Join Room", url: `http://t.me/RubyXProBot/RubyMusic?startapp=${chat_id}` },
      ],
      [
        { text: "Close", callback_data: `close_${chat_id}` },
      ],
    ];

    const reply_markup = { inline_keyboard: buttons };

    await axios.post(telegramApiUrl, {
      chat_id,
      text: `<b>Now Playing</b>\n\nName: ${song_name}\nDuration: ${duration}\nBy: ${singer}`,
      parse_mode: "HTML",
      reply_markup,
    });

    io.sockets.in(song.chat_id).emit("update_song", { chat_id: song.chat_id });
  });

  socket.on("songProgress", async ({ chat_id, timestamp }) => {
    try {
      const songs = await Music.find({ chat_id });
      if (songs.length > 0) {
        const song = songs[0];
        if (song.timestamp < timestamp) {
          song.timestamp = timestamp;
          await song.save();
          io.sockets.in(chat_id).emit("update_song_progress", { chat_id, timestamp });
        }
      }
    } catch (error) {
      console.log("song skipped");
    }
  });
});

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
