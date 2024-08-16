import server, { io } from "./app/index.js";

const port = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
  socket.on("join", ({ user_name, user_id, chat_id }) => {
    console.log("User joined", user_name, user_id, chat_id);
    socket.join(chat_id);
    
    socket.to(chat_id).emit("user_joined", { user_name, user_id });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
