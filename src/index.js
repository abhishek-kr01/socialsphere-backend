import express from "express";
import connectDB from "./config/dbConfig.js";
import apiRouter from './routers/apiRouter.js'

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.use('/api', apiRouter); // If the url starts with /api then the request is forwarded to the apiRouter

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' })
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
})