
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import mammoth from "mammoth";

export async function getFitReport(resumeText: string, jobDescriptionText: string): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  if (!resumeText || resumeText.length < 50) {
    return { data: null, error: "Please provide a more detailed resume." };
  }
  if (!jobDescriptionText || jobDescriptionText.length < 50) {
    return { data: null, error: "Please provide a more detailed job description." };
  }

  try {
    const result = await generateFitReport({ resumeText, jobDescriptionText });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "An error occurred while analyzing the documents. Please try again." };
  }
}

export async function getTextFromFile(formData: FormData): Promise<{ data: string | null; error: string | null }> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { data: null, error: "No file provided." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf") {
      const pdf = (await import("pdf-parse")).default;
      const data = await pdf(buffer, {});
      return { data: data.text, error: null };
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword") {
      const { value } = await mammoth.extractRawText({ buffer });
      return { data: value, error: null };
    } else if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
      return { data: buffer.toString(), error: null };
    }

    return { data: null, error: `Unsupported file type: ${file.type}` };
  } catch (e) {
    console.error(e);
    return { data: null, error: "Failed to read file." };
  }
}
