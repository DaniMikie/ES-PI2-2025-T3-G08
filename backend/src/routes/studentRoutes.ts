import { Router } from "express";
import { create, getAll, update, remove } from "../controllers/studentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/class/:classId", authMiddleware, getAll);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
