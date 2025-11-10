import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller";
import { createOrderSchema } from "../utils/validators";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";

const router = Router();

router.post("/", authenticate, validate(createOrderSchema), createOrder);
router.get("/", authenticate, getMyOrders);

export default router;
