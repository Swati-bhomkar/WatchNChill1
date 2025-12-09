// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // email as id
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Single image field used everywhere
    image: { type: String, default: "default.jpg" },

    city: { type: String },
    phone: { type: String },
    favoriteGenres: { type: String },
    preferredLanguage: { type: String },
    gender: { type: String },
    about: { type: String },

    password: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
