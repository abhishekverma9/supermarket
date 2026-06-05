import express from "express";
import {
  login,
  signupConsumer,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendLoginOtp,
  verifyLoginOtp,
  sendSignupOtp,
  verifySignupOtp,
  googleLogin,
} from "../controllers/authController.js";

const authRouter = express.Router();

// Routes
authRouter.post("/signup", signupConsumer);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/send-login-otp", sendLoginOtp);
authRouter.post("/verify-login-otp", verifyLoginOtp);
authRouter.post("/send-signup-otp", sendSignupOtp);
authRouter.post("/verify-signup-otp", verifySignupOtp);
authRouter.post("/google", googleLogin);

export default authRouter;
