import { PDFParse } from "pdf-parse";
import {
  generateInterviewreport,
  generateInterviewResumepdf,
} from "../services/aiService.js";
import { interviewReportModel } from "../models/interviewReportModel.js";
async function generateInterviewReportController(req, res) {
  let parser;

  try {
    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job Description is required" });
    }

    let resumeContent = "";

    if (req.file) {
      parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      resumeContent = result.text?.trim() || "";
    }

    if (!resumeContent && !selfDescription) {
      return res.status(400).json({
        message: "Either Resume PDF or Self-Description is required",
      });
    }

    const interviewByAi = await generateInterviewreport({
      resume: resumeContent,
      jobDescription,
      selfDescription: selfDescription || "",
    });
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resumeText: resumeContent,
      jobDescription,
      selfDescription: selfDescription || "",
      ...interviewByAi,
    });
    res.status(201).json({
      message: "interview report generated successfully",
      interviewReport,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate interview report",
      error: err.message,
    });
  } finally {
    await parser?.destroy();
  }
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  try {
    console.log("Generating PDF for report:", interviewReportId);
    
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      console.log("Report not found");
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    const { resumeText, jobDescription, selfDescription } = interviewReport;
    console.log("Report found. Resume length:", resumeText?.length, "Job desc length:", jobDescription?.length, "Self desc length:", selfDescription?.length);

    const pdfBuffer = await generateInterviewResumepdf({
      resume: resumeText || "",
      jobDescription,
      selfDescription: selfDescription || "",
    });

    console.log("PDF generated successfully, buffer size:", pdfBuffer.length);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to generate resume PDF",
      error: error.message,
      stack: error.stack,
    });
  }
}

export const interviewController = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
