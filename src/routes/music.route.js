import { Router } from "express";
import {
  searchYt,
  playSong,
  getCurrentSongs,
  pauseSong,
  resumeSong,
  skipSong,
  endSong,
} from "../controllers/music.controller.js";

const router = Router();

router.route("/song").get(searchYt);

router.route("/play").get(playSong);

router.route("/song-list").get(getCurrentSongs);

router.route("/pause").get(pauseSong);

router.route("/resume").get(resumeSong);

router.route("/skip").get(skipSong);

router.route("/end").get(endSong);

export default router;
