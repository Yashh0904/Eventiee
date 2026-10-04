import express from "express"
import { tokenRefresh, userLogin, userLogout, userRegistration } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post('/register', userRegistration);

authRouter.post('/login', userLogin);

authRouter.post('/refresh', tokenRefresh);

authRouter.post('/logout', userLogout);

export default authRouter;