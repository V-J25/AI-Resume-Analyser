import {
  generateInterviewReport,
  getInterviewReportById,
  getAllInterviewReports,
  generateResumePdf,
} from "../services/interview.api.js";
import { useCallback, useContext, useEffect } from "react";
import { InterviewContext } from "../InterviewContext.js";
import { useParams } from "react-router";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  // Default values if context is not available
  const defaultContext = {
    loading: false,
    setLoading: () => {},
    report: null,
    setReport: () => {},
    reports: [],
    setReports: () => {}
  };

  const finalContext = context || defaultContext;
  const { loading, setLoading, report, setReport, reports, setReports } = finalContext;
  const { interviewId } = useParams();

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      if (!response || !response.interviewReport) {
        throw new Error("Invalid response from server: no interview report returned");
      }
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to generate interview report",
        { cause: error },
      );
    } finally {
      setLoading(false);
    }
  };

  const getReportById = useCallback(async (interviewId) => {
    setLoading(true);
    try {
      const response = await getInterviewReportById(interviewId);
      if (!response || !response.interviewReport) {
        throw new Error("Failed to fetch interview report");
      }
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error("Error fetching report:", error);
      setReport(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReport]);

  const getReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReports();
      if (!response || !Array.isArray(response.interviewReports)) {
        throw new Error("Invalid response format");
      }
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const getResumePdf = async (interviewReportId) => {
    setLoading(true);
    try {
      const response = await generateResumePdf({ interviewReportId });
      if (!response) {
        throw new Error("Failed to generate PDF");
      }
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    } else {
      getReports();
    }
  }, [interviewId, getReportById, getReports]);
  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
};
