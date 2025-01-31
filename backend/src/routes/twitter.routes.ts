import express from "express";
import {
  loginTwitter,
  verifyCallBack,
} from "../controllers/twitter.controllers";
const twitterRoutes = express.Router();
twitterRoutes.get("/login", loginTwitter);
twitterRoutes.get("/callback", verifyCallBack);

export default twitterRoutes;
