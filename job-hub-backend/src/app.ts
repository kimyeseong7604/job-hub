import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use("/api/users", userRoutes);

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobhub", {
  autoIndex: true
}).then(() => {
  console.log("MongoDB 연결 성공");
}).catch(err => {
  console.error("MongoDB 연결 실패", err);
});

export default app;
