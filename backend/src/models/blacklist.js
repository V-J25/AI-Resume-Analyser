import mongoose from "mongoose";

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to add in blacklist"],
    },
  },
  {
    timestamps: true,
  },
);
export const tokenBlacklistModel = mongoose.model(
  "BlacklistToken",
  blacklistTokenSchema,
);
