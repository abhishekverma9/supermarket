import express from "express";
import { login, signupConsumer } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signupConsumer);
authRouter.post("/login", login);

export default authRouter;
