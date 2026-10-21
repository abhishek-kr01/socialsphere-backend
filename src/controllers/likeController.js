import {
    addLikeService,
    removeLikeService,
} from "../services/likeService.js";

export const addLike = async (req, res) => {
    try {
        const result = await addLikeService({
            userId: req.user._id,
            onModel: req.params.onModel,
            likeableId: req.params.likeableId,
        });

        return res.status(result.alreadyLiked ? 200 : 201).json({
            success: true,
            message: result.alreadyLiked
                ? "You have already liked this item"
                : "Like added successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.status
                ? error.message
                : "Internal Server Error",
        });
    }
};

export const removeLike = async (req, res) => {
    try {
        const result = await removeLikeService({
            userId: req.user._id,
            onModel: req.params.onModel,
            likeableId: req.params.likeableId,
        });

        return res.status(200).json({
            success: true,
            message: result.alreadyUnliked
                ? "This item is already unliked"
                : "Like removed successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.status
                ? error.message
                : "Internal Server Error",
        });
    }
};
