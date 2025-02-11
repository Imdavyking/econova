import express from "express";
import {
  deleteTwitterCookie,
  getUserTwitterInfo,
} from "../controllers/user.controllers";
const userRoutes = express.Router();
userRoutes.get("/", getUserTwitterInfo);
userRoutes.get("/logout", deleteTwitterCookie);
userRoutes.get("/get-course-proof", deleteTwitterCookie);
userRoutes.get("/get-course-proof", deleteTwitterCookie);

export default userRoutes;
