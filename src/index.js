import express from "express";
import connectDB from "./config/dbConfig.js";

const PORT = 3000;

const app = express();

app.get('/ping', (req, res) => {
    return res.json({message: 'pong'})
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
})