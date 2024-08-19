// u can run this when u have to record all users left the room
// const chat_id = user.chat_id;
// const users = await User.find({ chat_id });
// if (users.length <= 1) {
//   console.log("Last user left, saving timestamp");
//   const timeStamp = songProgressMap.get(chat_id) || 0;
//   const musics = await Music.find({ chat_id });
//   if (!musics || musics.length === 0) {
//     return;
//   }
//   const currentMusic = musics[0];
//   currentMusic.timestamp = timeStamp;
//   await currentMusic.save();
//   io.sockets.in(chat_id).emit("update_song", { chat_id });
// }

// Get all clients in a room
// const clients = await io.in(chat_id).fetchSockets();
// console.log(
//   `Clients in room ${chat_id}:`,
//   clients.map((client) => client.id)
// );
