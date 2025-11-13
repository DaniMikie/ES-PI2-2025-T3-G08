import { Router } from "express";
import { create, getAll, remove } from "../controllers/gradeComponentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/subject/:subjectId", authMiddleware, getAll);
router.delete("/subject/:subjectId", authMiddleware, remove);

export default router;
