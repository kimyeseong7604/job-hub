import { Router } from "express";
import {
  createBookmark,
  getMyBookmarks,
  updateBookmark,
  deleteBookmark
} from "../controllers/bookmark.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createBookmark);
router.get("/", getMyBookmarks);
router.patch("/:id", updateBookmark);
router.delete("/:id", deleteBookmark);

export default router;
