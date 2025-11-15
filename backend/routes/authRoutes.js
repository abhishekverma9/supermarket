import express from "express";
import {
  login,
  signupConsumer,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signupConsumer);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
