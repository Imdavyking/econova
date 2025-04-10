import express from "express";
import { getVerifiedSourceCode } from "../controllers/source.code.controllers";

const sourceCodeRoutes = express.Router();
sourceCodeRoutes.post("/", getVerifiedSourceCode);

export default sourceCodeRoutes;
