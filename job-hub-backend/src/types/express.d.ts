import { Types } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload {
      userId: Types.ObjectId;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
