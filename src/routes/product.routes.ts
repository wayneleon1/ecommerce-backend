import { Router } from "express";
import {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
} from "../controllers/product.controller";
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
} from "../utils/validators";
import { validate, validateQuery } from "../middleware/validator.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", validateQuery(paginationSchema), getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  updateProduct
);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
