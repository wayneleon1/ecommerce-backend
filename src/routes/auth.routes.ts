import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../utils/validators";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import { validate } from "../middleware/validator.middleware";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);

export default router;
