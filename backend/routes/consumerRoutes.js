import express from "express";
import { getProfile, updateProfile } from "../controllers/consumerController.js";
import authRole from "../middlewares/authRole.js";

const consumerRouter = express.Router();

consumerRouter.get("/profile", authRole("consumer"), getProfile);
consumerRouter.post("/update-profile", authRole("consumer"), updateProfile);

export default consumerRouter;
