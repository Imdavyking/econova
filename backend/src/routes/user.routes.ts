import express from "express";
import {
  deleteTwitterCookie,
  getUserTwitterInfo,
} from "../controllers/user.controllers";
const userRoutes = express.Router();
userRoutes.get("/", getUserTwitterInfo);
userRoutes.get("/logout", deleteTwitterCookie);

export default userRoutes;
