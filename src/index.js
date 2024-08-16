import server, { io } from "./app/index.js";
import getAvatar from "./utils/getAvatar.js";
const users = {};

const port = process.env.PORT || 5000;

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });

  socket.on("join", async ({ user_name, user_id, chat_id }) => {
    console.log("User joined", user_name, user_id, chat_id);
    socket.join(chat_id);
    const avatar = await getAvatar(user_id);

    // Add user to the list of users in the chat room
    if (!users[chat_id]) {
      users[chat_id] = [];
    }
    users[chat_id].push({ user_name, user_id, avatar });

    // Notify other users in the chat room
    socket.to(chat_id).emit("user_joined", { user_name, user_id, avatar });

    socket.to(chat_id).emit("users_list", users[chat_id]);
  });

  socket.on("request_users", ({ chat_id }) => {
    // Send the list of users in the chat room to the requesting client
    if (users[chat_id]) {
      socket.emit("users_list", users[chat_id]);
      console.log(users)
    } else {
      socket.emit("users_list", []);
    }
  });
  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
