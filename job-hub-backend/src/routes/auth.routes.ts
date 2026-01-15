import { Router } from "express";
import { login, register, me, logout } from "../controllers/auth.controller.js";
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
 * @route   POST /api/auth/logout
 * @desc    로그아웃 (JWT 필요, 클라이언트 토큰 삭제)
 */
router.post("/logout", authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    내 정보 조회 (JWT 필요)
 */
router.get("/me", authMiddleware, me);

export default router;
