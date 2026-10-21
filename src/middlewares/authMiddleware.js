import { checkIfUserExists } from "../services/userService.js";
import { verifyJWT } from "../utils/jwt.js";

export const isAuthenticated = async (req, res, next) => {
    // Check if jwt is passed in the header
    const token = req.headers["x-access-token"];

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token is required"
        })
    }

    // verify the token
    try {
        const payload = verifyJWT(token);

        const user = await checkIfUserExists(payload.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = {
            _id: user._id,
            email: user.email,
            username: user.username
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}