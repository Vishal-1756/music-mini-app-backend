import { Router } from 'express';
import { searchYt } from '../controllers/ytdl.controller.js';

const router = Router();

router.route("/song").get(searchYt);

export default router;