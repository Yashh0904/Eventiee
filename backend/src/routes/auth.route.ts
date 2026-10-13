import express from "express"
import { tokenRefresh, userLogin, userLogout, userRegistration } from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post('/register', userRegistration);

authRouter.post('/login', userLogin);

authRouter.post('/refresh', tokenRefresh);

authRouter.post('/logout', authMiddleWare, userLogout);

export default authRouter;