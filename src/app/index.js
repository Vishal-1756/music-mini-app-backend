import express from "express";
import cors from "cors";
const app = express();
import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer(app);

const corsPolicy = {
  origin: "*",
  credentials: true,
};

const io = new Server(server, {
  cors: corsPolicy,
});

app.use(cors(corsPolicy));

app.get("/", (req, res) => res.json({ message: "Running..." }));

//Routes
import musicRouter from "../routes/music.route.js";
app.use("/", musicRouter);

import userRouter from "../routes/user.route.js";
app.use("/", userRouter);

export { app, io };

export default server;
