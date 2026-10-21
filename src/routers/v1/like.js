import express from "express";

import {
    addLike,
    removeLike,
} from "../../controllers/likeController.js";

import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:onModel/:likeableId", isAuthenticated, addLike);

router.delete("/:onModel/:likeableId", isAuthenticated, removeLike);

export default router;
