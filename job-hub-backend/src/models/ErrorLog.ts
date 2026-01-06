import { Schema, model, Document } from "mongoose";

export interface IErrorLog extends Document {
  source: string;
  errorType: string;
  message: string;
  metadata?: any;
}

const ErrorLogSchema = new Schema<IErrorLog>({
  source: { type: String, required: true },
  errorType: { type: String, required: true },
  message: { type: String, required: true },
  metadata: Schema.Types.Mixed
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ErrorLog = model<IErrorLog>("ErrorLog", ErrorLogSchema);