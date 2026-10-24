import express from "express"
import { getMe, tokenRefresh, updateProfile, userLogin, userLogout, userRegistration } from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post('/register', userRegistration);

authRouter.post('/login', userLogin);

authRouter.post('/refresh', tokenRefresh);

authRouter.post('/logout', userLogout);

authRouter.get('/me', authMiddleWare, getMe);

authRouter.patch('/me', authMiddleWare, updateProfile);

export default authRouter;