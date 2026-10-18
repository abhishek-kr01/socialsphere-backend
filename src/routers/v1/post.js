import express from "express";

import { s3uploader } from "../../config/multerConfig.js"
import { createPost, getAllPosts } from "../../controllers/postController.js"

const router = express.Router(); // Router object to modularize the routes

// we look at the remaining url part after /posts

router.post('/', s3uploader.single('image'), createPost);

router.get('/', getAllPosts);

export default router;