import express from "express";
import { storeMerkleRoot } from "../controllers/merkle.controllers";

const merkleRoutes = express.Router();

// Route to store a new Merkle root (add a value)
merkleRoutes.post("/store", storeMerkleRoot);

export default merkleRoutes;
