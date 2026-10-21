import express from "express";
import connectDB from "./config/dbConfig.js";
import apiRouter from './routers/apiRouter.js'
import { isAuthenticated } from "./middlewares/authMiddleware.js";
import ip from "ip";

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.use('/api', apiRouter); // If the url starts with /api then the request is forwarded to the apiRouter

app.get('/ping', isAuthenticated, (req, res) => {
    // console.log(req.query);
    // console.log(req.body);
    console.log(req.user);
    const ipaddr = ip.address();
    return res.json({ message: 'pong' + ipaddr})
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
})