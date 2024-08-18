import { Router } from "express";
import {
  getRoomUsers,
  fetchFrontendUsers,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/get-users").get(getRoomUsers);

router.route("/get-frontend-users").get(fetchFrontendUsers);

export default router;
