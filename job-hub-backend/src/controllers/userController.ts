import { Request, Response } from "express";
import { User } from "../models/User.js";

// 모든 사용자 조회
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err });
  }
};

// 특정 사용자 조회
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err });
  }
};

// 사용자 생성
export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: "생성 실패", error: err });
  }
};

// 사용자 업데이트
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "사용자 없음" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "업데이트 실패", error: err });
  }
};

// 사용자 삭제
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "사용자 없음" });
    res.json({ message: "삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패", error: err });
  }
};