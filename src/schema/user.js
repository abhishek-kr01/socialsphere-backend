import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 5
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        validate: {
            validator: function (emailValue) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue);
            },
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
}, { timestamps: true });

userSchema.pre("save", function modifyPassword() {
    const user = this;

    // Hash only when the password is new or modified
    if (!user.isModified("password")) {
        return;
    }

    const SALT = bcrypt.genSaltSync(9);

    // Hash password
    const hashPassword = bcrypt.hashSync(user.password, SALT);

    // Replace plain password with hashed password
    user.password = hashPassword;
});

const user = mongoose.model("User", userSchema) // user collection
export default user;