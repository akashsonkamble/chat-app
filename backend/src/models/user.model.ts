import * as bcrypt from "bcryptjs";
import mongoose, { Model, Schema, model } from "mongoose";
import { IAvatar, IUser } from "../types/user.type";

const avatarSchema = new Schema<IAvatar>({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
});

const userSchema = new Schema<IUser>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true,
        },
        avatar: {
            type: avatarSchema,
            required: [true, "Avatar is required"],
        },
        password: {
            type: String,
            minLength: [6, "Password must be at least 6 characters long"],
            required: [true, "Password is required"],
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
