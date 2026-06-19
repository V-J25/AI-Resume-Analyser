import rateLimit from "express-rate-limit";

const reportGenerationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 report generations per user per day
  keyGenerator: (req) => req.user.id.toString(), // per-user, since this route is already authenticated
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "You've reached your daily limit for generating interview reports. Please try again tomorrow.",
  },
});

const resumePdfLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10, // PDF generation is cheaper than the full report call, so a bit higher
  keyGenerator: (req) => req.user.id.toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "You've reached your daily limit for resume PDF generation.",
  },
});

export const rateLimiter = { reportGenerationLimiter, resumePdfLimiter };
