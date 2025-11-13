import { Router } from "express";
import { save, getByStudent, getByClass } from "../controllers/gradeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, save);
router.get("/student/:studentId", authMiddleware, getByStudent);
router.get("/class/:classId", authMiddleware, getByClass);

export default router;
