import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    회원가입
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    로그인 (JWT 발급)
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    내 정보 조회 (JWT 필요)
 */
router.get("/me", authMiddleware, me);

export default router;
