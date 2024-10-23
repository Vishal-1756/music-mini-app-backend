import server, { io } from "./app/index.js";
import getAvatar from "./utils/getAvatar.js";
import connectDB from "./db.js";
import { User } from "./models/user.model.js";
import { Music } from "./models/music.model.js";

const port = process.env.PORT || 5000;

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  socket.on("disconnect", async () => {
    console.log("User disconnected", socket.id);
    const user = await User.findOne({ socket_id: socket.id });
    if (!user) {
      return;
    }

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

  socket.on("join", async ({ user_name, user_id, chat_id, socket_id }) => {
    console.log("User joined", user_name, user_id, chat_id, socket_id);
    socket.join(chat_id);
    const avatar = await getAvatar(user_id);

    // Add user to the list of users in the chat room
    const user = await User.findOne({ user_id });
    if (user) {
      console.log("User already exists");
      await User.findByIdAndDelete(user._id);
    }

    const newUser = new User({
      user_name,
      user_id,
      avatar,
      chat_id,
      socket_id,
    });
    await newUser.save();

    io.sockets
      .in(chat_id)
      .emit("user_joined", { user_name, user_id, avatar, chat_id });

    io.sockets.in(chat_id).emit("update_users", {
      chat_id: chat_id,
      type: "joined",
      user_name: user_name,
    });
  });

  socket.on("songEnded", async ({ _id }) => {
    console.log("Song ended", _id);

    const song = await Music.findByIdAndDelete(_id);
    if (!song) {
      return;
    }
    io.sockets.in(song.chat_id).emit("update_song", { chat_id: song.chat_id });
  });

  socket.on("songProgress", async ({ chat_id, timestamp }) => {
    try {
      const musics = await Music.find({ chat_id });
      if (musics) {
        const music = musics[0];
        if (music.timestamp < timestamp) {
          music.timestamp = timestamp;

          await music.save();
          io.sockets
            .in(chat_id)
            .emit("update_song_progress", { chat_id, timestamp });
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
