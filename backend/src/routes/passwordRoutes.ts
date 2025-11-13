import { Router } from "express";
import { requestReset, verifyCode, resetPassword } from "../controllers/passwordController";

const router = Router();

router.post("/request-reset", requestReset);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

export default router;
