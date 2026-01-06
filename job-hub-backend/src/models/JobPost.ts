import { Schema, model, Document } from "mongoose";

interface JobSummary {
  role?: string;
  requirements: string[];
  preferred: string[];
  stack: string[];
  process?: string;
  location?: string;
}

export interface IJobPost extends Document {
  fingerprint: string;
  title: string;
  company: string;
  summary: JobSummary;
  techStack: string[];
  deadline?: Date;
  link?: string;
}

const JobSummarySchema = new Schema<JobSummary>({
  role: String,
  requirements: { type: [String], default: [] },
  preferred: { type: [String], default: [] },
  stack: { type: [String], default: [] },
  process: String,
  location: String
}, { _id: false });

const JobPostSchema = new Schema<IJobPost>({
  fingerprint: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  summary: JobSummarySchema,
  techStack: { type: [String], index: true },
  deadline: Date,
  link: { type: String, unique: true }
}, { timestamps: true });

export const JobPost = model<IJobPost>("JobPost", JobPostSchema);