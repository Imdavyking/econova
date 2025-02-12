import express from "express";
import {
  deleteTwitterCookie,
  getUserTwitterInfo,
} from "../controllers/user.controllers";
import { auth } from "../middlewares/auth";
const userRoutes = express.Router();
userRoutes.get("/", auth, getUserTwitterInfo);
userRoutes.get("/logout", auth, deleteTwitterCookie);

export default userRoutes;
