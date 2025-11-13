import { Router } from "express";
import { create, getAll, update, remove, exportCSV } from "../controllers/studentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/class/:classId", authMiddleware, getAll);
router.get("/class/:classId/export", authMiddleware, exportCSV);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
