import { Schema, model, Document, Types } from "mongoose";

export type ScheduleType = "DOCUMENT" | "INTERVIEW" | "CODING_TEST" | "ASSIGNMENT" | "FOLLOW_UP" | "CUSTOM";

export interface ISchedule extends Document {
  userId: Types.ObjectId;
  bookmarkId: Types.ObjectId;
  type: ScheduleType;
  eventDate: Date;
  title: string;
}

const ScheduleSchema = new Schema<ISchedule>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookmarkId: { type: Schema.Types.ObjectId, ref: "Bookmark", required: true },
  type: { type: String, enum: ["DOCUMENT", "INTERVIEW", "CODING_TEST", "ASSIGNMENT", "FOLLOW_UP", "CUSTOM"], required: true },
  eventDate: { type: Date, required: true },
  title: { type: String, required: true }
}, { timestamps: true });

export const Schedule = model<ISchedule>("Schedule", ScheduleSchema);