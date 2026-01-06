import { Schema, model, Document, Types } from "mongoose";

interface Tag {
  _id?: Types.ObjectId;
  name: string;
  color: string;
}

interface DailyDigest {
  enabled: boolean;
  time?: string;
}

interface EventNotif {
  deadlineDMinus: number[];
}

interface Channel {
  email: boolean;
  push: boolean;
}

interface NotifSetting {
  enabled: boolean;
  timezone: string;
  dailyDigest: DailyDigest;
  event: EventNotif;
  channel: Channel;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  tags: Tag[];
  notifSetting: NotifSetting;
}

const TagSchema = new Schema<Tag>({
  name: { type: String, required: true },
  color: { type: String, required: true }
}, { _id: true });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  tags: { type: [TagSchema], default: [] },
  notifSetting: {
    enabled: { type: Boolean, default: true },
    timezone: { type: String, default: "Asia/Seoul" },
    dailyDigest: {
      enabled: { type: Boolean, default: true },
      time: String
    },
    event: {
      deadlineDMinus: { type: [Number], default: [] }
    },
    channel: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

export const User = model<IUser>("User", UserSchema);