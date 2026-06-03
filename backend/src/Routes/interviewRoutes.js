import express from "express";
const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";
import { interviewController } from "../controller/interviewController.js";
import { upload } from "../middleware/multer.js";
router.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);
router.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
router.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController,
);
/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
router.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController,
);

export const interviewRouter = router;
