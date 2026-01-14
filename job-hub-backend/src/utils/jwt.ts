import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "7d";

export interface JwtUserPayload {
  userId: string;
}

export const signToken = (userId: string): string => {
  const payload: JwtUserPayload = { userId };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
};
