import express from "express";
import { authrouter } from "./Routes/authroutes.js";
import { interviewRouter } from "./Routes/interviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const vpp = express();

//middleware
vpp.use(express.json());
vpp.use(cookieParser());
vpp.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://ai-resume-analyser-frontend-pearl.vercel.app",
    ],
    credentials: true,
  }),
);

// Request logging middleware
vpp.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

//routes
vpp.use("/api/auth", authrouter);
vpp.use("/api/interview", interviewRouter);
export const app = vpp;
