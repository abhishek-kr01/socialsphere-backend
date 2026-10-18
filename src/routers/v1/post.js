import express from "express";

import { s3uploader } from "../../config/multerConfig.js"
import { createPost, deletePost, getAllPosts, updatePost } from "../../controllers/postController.js"
import { validate } from "../../validators/zodValidator.js";
import { zodPostSchema } from "../../validators/zodPostSchema.js";

const router = express.Router(); // Router object to modularize the routes

// we look at the remaining url part after /posts

router.post('/', s3uploader.single('image'), validate(zodPostSchema), createPost);

router.get('/', getAllPosts);

router.delete('/:id', deletePost);

router.put("/:id", s3uploader.single('image'), updatePost);

export default router;