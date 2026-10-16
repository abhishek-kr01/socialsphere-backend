import express from "express";
import connectDB from "./config/dbConfig.js";
import { createPost } from "./controllers/postController.js";
import { s3uploader } from "./config/multerConfig.js";

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' })
})

app.post('/posts', s3uploader.single('image'), createPost)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
})