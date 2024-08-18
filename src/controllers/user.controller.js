import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { io } from "../app/index.js";

const getRoomUsers = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;
  const users = await User.find({ chat_id });
  if (!users) {
    new ApiResponse(200, { users: [] })
  }
  res.json(new ApiResponse(200, users));
});

const fetchFrontendUsers = asyncHandler(async (req, res) => {
  const { chat_id } = req.query;
  const clients = await io.in(chat_id).fetchSockets();
    // console.log(
    //   `Clients in room ${chat_id}:`,
    //   clients.map((client) => client.id)
    // );
    const users = clients.map(client => client.id);
    return res.json(new ApiResponse(200, users));
})

export { getRoomUsers, fetchFrontendUsers };
