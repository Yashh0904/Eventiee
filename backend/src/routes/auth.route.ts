import express from "express"
import { getMe, tokenRefresh, updateProfile, userLogin, userLogout, userRegistration } from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { loginLimiter, refreshLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

const authRouter = express.Router();

authRouter.post('/register', registerLimiter, userRegistration);

authRouter.post('/login', loginLimiter, userLogin);

authRouter.post('/refresh', refreshLimiter, tokenRefresh);

authRouter.post('/logout', userLogout);

authRouter.get('/me', authMiddleWare, getMe);

authRouter.patch('/me', authMiddleWare, updateProfile);

export default authRouter;