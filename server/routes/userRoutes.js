// routes/userRoutes.js
import express from "express";
import { getUserBookings, getProfile, updateProfile } from "../controllers/userController.js";
import { protectUser } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/booking", getUserBookings);

// Get logged-in user's profile
userRouter.get("/profile", protectUser, getProfile);

// Update profile (image sent as base64 in JSON body)
userRouter.put("/profile", protectUser, updateProfile);

export default userRouter;
