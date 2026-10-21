import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        onModel: {
            type: String,
            required: true,
            enum: ["Post", "Comment"],
        },
        likeableId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "onModel",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

likeSchema.index(
    { user: 1, onModel: 1, likeableId: 1 },
    { unique: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
