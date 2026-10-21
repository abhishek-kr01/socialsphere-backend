
import Like from "../schema/like.js";
import Post from "../schema/post.js";
import Comment from "../schema/comment.js";

const getTargetModel = (onModel) => {
    if (onModel === "Post") return Post;
    if (onModel === "Comment") return Comment;
    return null;
};

export const findLikeTarget = async (onModel, likeableId) => {
    const Model = getTargetModel(onModel);

    if (!Model) return null;

    return Model.findById(likeableId);
};

export const findLikeByUserAndTarget = async (
    userId,
    onModel,
    likeableId
) => {
    return Like.findOne({
        user: userId,
        onModel,
        likeableId,
    });
};

export const createLike = async (userId, onModel, likeableId) => {
    return Like.create({
        user: userId,
        onModel,
        likeableId,
    });
};

export const deleteLikeById = async (likeId) => {
    return Like.findByIdAndDelete(likeId);
};

export const updateTargetLikes = async (
    onModel,
    likeableId,
    likeId,
    action
) => {
    const Model = getTargetModel(onModel);

    if (!Model) return null;

    const update =
        action === "add"
            ? { $addToSet: { likes: likeId } }
            : { $pull: { likes: likeId } };

    return Model.findByIdAndUpdate(likeableId, update, {
        new: true,
    });
};
