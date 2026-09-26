import express from "express"
import { tokenRefreshController, userLoginController, userRegistrationController, tokenLogoutController } from "../controllers/auth.controller.js";
import { authMiddleWare } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post('/register', userRegistrationController);

authRouter.post('/login', userLoginController);

authRouter.post('/refresh', tokenRefreshController);

authRouter.post('/logout', tokenLogoutController);

export default authRouter;