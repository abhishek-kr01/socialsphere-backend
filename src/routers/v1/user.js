import express from "express";
import { getProfile } from "../../controllers/userController.js";

const router = express.Router();

// After /users the remainaing part of url is handled here
router.get('/profile', getProfile);

export default router;