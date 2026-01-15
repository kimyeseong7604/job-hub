import { Request, Response } from "express";
import { Bookmark } from "../models/Bookmark.js";
import { Types } from "mongoose";

export const createBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { jobId, status, memo, nextActionDate } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const exists = await Bookmark.findOne({ userId, jobId });
    if (exists) {
      return res.status(409).json({ message: "Bookmark already exists" });
    }

    const bookmark = await Bookmark.create({
      userId,
      jobId,
      status,
      memo,
      nextActionDate
    });

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: "Create bookmark failed", error });
  }
};

export const getMyBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const bookmarks = await Bookmark.find({ userId })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Fetch bookmarks failed", error });
  }
};


export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bookmark id" });
    }

    const bookmark = await Bookmark.findOne({ _id: id, userId });
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    const { status, memo, nextActionDate, isNotified } = req.body;

    if (status !== undefined) bookmark.status = status;
    if (memo !== undefined) bookmark.memo = memo;
    if (nextActionDate !== undefined) bookmark.nextActionDate = nextActionDate;
    if (isNotified !== undefined) bookmark.isNotified = isNotified;

    await bookmark.save();

    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ message: "Update bookmark failed", error });
  }
};


export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bookmark id" });
    }

    const deleted = await Bookmark.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete bookmark failed", error });
  }
};
