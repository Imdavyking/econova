import express from "express";
import { getUserTwitterInfo } from "../controllers/user.controllers";
import { auth } from "../middlewares/auth";
const userRoutes = express.Router();
userRoutes.get("/", auth, getUserTwitterInfo);

export default userRoutes;
