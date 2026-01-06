import { Schema, model, Document, Types } from "mongoose";

export type BookmarkStatus = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  status: BookmarkStatus;
  memo?: string;
  nextActionDate?: Date;
  isNotified: boolean;
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "JobPost", required: true },
  status: { type: String, enum: ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"], default: "SAVED" },
  memo: String,
  nextActionDate: Date,
  isNotified: { type: Boolean, default: false }
}, { timestamps: true });

export const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);