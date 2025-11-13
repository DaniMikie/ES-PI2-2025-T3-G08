import { Router } from "express";
import { getOne } from "../controllers/courseController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/:id", authMiddleware, getOne);

export default router;
