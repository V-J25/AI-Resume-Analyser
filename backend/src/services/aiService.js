import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import puppeteer from "puppeteer";
dotenv.config({ path: new URL("../../.env", import.meta.url) });

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const interviewReportSchema = z.object({
  matchScore: z.coerce
    .number()
    .min(0)
    .max(100)
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["Low", "Mid", "High"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z.coerce
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .optional()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

const interviewReportJsonSchema = {
  type: "object",
  properties: {
    matchScore: { type: "number" },
    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
        additionalProperties: false,
      },
    },
    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
        additionalProperties: false,
      },
    },
    skillGaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          severity: { type: "string", enum: ["Low", "Mid", "High"] },
        },
        required: ["skill", "severity"],
        additionalProperties: false,
      },
    },
    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
        additionalProperties: false,
      },
    },
    title: { type: "string" },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
    "title",
  ],
  additionalProperties: false,
};

export const generateInterviewreport = async function generateInterviewReport({
  resume,
  jobDescription,
  selfDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return only valid JSON with these exact fields:
- matchScore: a number between 0 and 100
- technicalQuestions: array of objects { question, intention, answer }
- behavioralQuestions: array of objects { question, intention, answer }
- skillGaps: array of objects { skill, severity } where severity is Low, Mid, or High
- preparationPlan: array of objects { day, focus, tasks }
- title: string

Do not include any markdown, explanation, or extra top-level fields. Output must be a single JSON object only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewReportJsonSchema,
      temperature: 0,
      maxOutputTokens: 4096,
    },
  });
  const responseText = response.text?.trim();

  if (!responseText) {
    throw new Error("AI response text is empty");
  }

  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    throw new Error(
      `AI response was not valid JSON: ${err.message}. Response started with: ${responseText.slice(
        0,
        300,
      )}`,
    );
  }

  const report = interviewReportSchema.parse(parsed);

  return {
    ...report,
    title: report.title || jobDescription.split("\n")[0].slice(0, 80),
  };
};

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

export const generateInterviewResumepdf = async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });
  const resumePdfJsonSchema = {
    type: "object",
    properties: {
      html: { type: "string" },
    },
    required: ["html"],
    additionalProperties: false,
  };

  const prompt = `Generate a targeted, ATS-friendly resume for a candidate using these details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return only a JSON object with a single field "html". The "html" value must be complete HTML that can be converted to PDF.

Requirements:
- Tailor the resume specifically to the job description.
- Identify the important required and preferred skills, tools, technologies, domain keywords, responsibilities, and qualifications from the job description.
- Include a clear Skills section containing the relevant skills needed for this particular job.
- Naturally include job-description keywords in the summary, skills, and experience sections so the resume is ATS friendly.
- Keep the resume honest: do not invent employers, degrees, certifications, projects, metrics, or experience that are not supported by the resume or self description.
- If a required job skill is not clearly present in the candidate details, include it only in a "Relevant Exposure" or "Additional Skills" style subsection when reasonable, not as proven work experience.
- Use simple ATS-friendly structure: contact/header, professional summary, skills, experience/projects, education if available, and optional certifications if available.
- Avoid complex layouts, tables, columns, icons, images, canvas, SVG, heavy styling, or decorative elements that ATS systems may not parse.
- Use semantic HTML headings, paragraphs, and lists with simple professional styling.
- Keep it concise, ideally 1-2 pages when converted to PDF.
- Make the writing sound natural and human, not AI-generated.

Do not include markdown, explanation, or any extra JSON fields.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfJsonSchema,
    },
  });

  const responseText = response.text?.trim();

  if (!responseText) {
    throw new Error("AI resume response text is empty");
  }

  const jsonContent = resumePdfSchema.parse(JSON.parse(responseText));

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
};
