import express from "express";
import { getUserTwitterInfo } from "../controllers/user.controllers";
const userRoutes = express.Router();
userRoutes.get("/", getUserTwitterInfo);

export default userRoutes;
