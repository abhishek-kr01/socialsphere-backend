import express from 'express';
import postRouter from './post.js'
import userRouter from './user.js'
import commentRouter from './comment.js'
import likeRouter from "./like.js";

const router = express.Router();

router.use('/posts', postRouter); // If in the remaining url i.e. after /api/v1, we have the rul starting with /posts , then the request is forwarded to postRouter

router.use('/users', userRouter); // If in the remaining url i.e. after /api, we have the rul starting with /users/v1 , then the request is forwarded to postRouter

router.use('/comments', commentRouter)

router.use("/likes", likeRouter);

export default router;