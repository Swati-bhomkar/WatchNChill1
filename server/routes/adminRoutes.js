// server/routes/adminRoutes.js
import express from "express";
import {
  isAdmin,
  getDashBoardData,
  getAllShows,
  getAllBookings,
  deleteShow,
  getAllUsers
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/auth.js"; // if you have this
const router = express.Router();

router.get("/is-admin", protectAdmin, isAdmin);
router.get("/dashboard", protectAdmin, getDashBoardData);
router.get("/shows", protectAdmin, getAllShows);
router.delete("/shows/:id", protectAdmin, deleteShow);
router.get("/bookings", protectAdmin, getAllBookings);
router.get("/users", protectAdmin, getAllUsers);

export default router;

