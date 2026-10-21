
import mongoose from "mongoose";

import {
    createLike,
    deleteLikeById,
    findLikeByUserAndTarget,
    findLikeTarget,
    updateTargetLikes,
} from "../repositories/likeRepository.js";

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const normalizeOnModel = (value) => {
    const model = value?.toLowerCase();

    if (model === "post") return "Post";
    if (model === "comment") return "Comment";

    throw createError(400, "Type must be post or comment");
};

const validateIds = (userId, likeableId) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw createError(401, "Invalid authenticated user");
    }

    if (!mongoose.isValidObjectId(likeableId)) {
        throw createError(400, "Invalid post or comment ID");
    }
};

export const addLikeService = async ({
    userId,
    onModel,
    likeableId,
}) => {
    const model = normalizeOnModel(onModel);
    validateIds(userId, likeableId);

    const target = await findLikeTarget(model, likeableId);

    if (!target) {
        throw createError(404, `${model} not found`);
    }

    const existingLike = await findLikeByUserAndTarget(
        userId,
        model,
        likeableId
    );

    if (existingLike) {
        const updatedTarget = await updateTargetLikes(
            model,
            likeableId,
            existingLike._id,
            "add"
        );

        return {
            like: existingLike,
            onModel: model,
            likeableId,
            liked: true,
            alreadyLiked: true,
            likeCount: updatedTarget.likes.length,
        };
    }

    let like;

    try {
        like = await createLike(userId, model, likeableId);
    } catch (error) {
        // Handle simultaneous requests for the same like.
        if (error.code === 11000) {
            const existing = await findLikeByUserAndTarget(
                userId,
                model,
                likeableId
            );

            if (existing) {
                const updatedTarget = await updateTargetLikes(
                    model,
                    likeableId,
                    existing._id,
                    "add"
                );

                return {
                    like: existing,
                    onModel: model,
                    likeableId,
                    liked: true,
                    alreadyLiked: true,
                    likeCount: updatedTarget.likes.length,
                };
            }
        }

        throw error;
    }

    const updatedTarget = await updateTargetLikes(
        model,
        likeableId,
        like._id,
        "add"
    );

    if (!updatedTarget) {
        await deleteLikeById(like._id);
        throw createError(404, `${model} not found`);
    }

    return {
        like,
        onModel: model,
        likeableId,
        liked: true,
        alreadyLiked: false,
        likeCount: updatedTarget.likes.length,
    };
};

export const removeLikeService = async ({
    userId,
    onModel,
    likeableId,
}) => {
    const model = normalizeOnModel(onModel);
    validateIds(userId, likeableId);

    const target = await findLikeTarget(model, likeableId);

    if (!target) {
        throw createError(404, `${model} not found`);
    }

    const existingLike = await findLikeByUserAndTarget(
        userId,
        model,
        likeableId
    );

    if (!existingLike) {
        return {
            onModel: model,
            likeableId,
            liked: false,
            alreadyUnliked: true,
            likeCount: target.likes.length,
        };
    }

    await deleteLikeById(existingLike._id);

    const updatedTarget = await updateTargetLikes(
        model,
        likeableId,
        existingLike._id,
        "remove"
    );

    if (!updatedTarget) {
        throw createError(404, `${model} not found`);
    }

    return {
        onModel: model,
        likeableId,
        liked: false,
        alreadyUnliked: false,
        likeCount: updatedTarget.likes.length,
    };
};
