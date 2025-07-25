
"use server";
import { generateFitReport, type GenerateFitReportInput, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";

export async function analyzeDocuments(input: GenerateFitReportInput): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  try {
    const { resumeText, jobDescriptionText } = input;

    if (!resumeText || resumeText.trim().length < 50) {
      return { data: null, error: "Please provide a complete resume (at least 50 characters)." };
    }
    if (!jobDescriptionText || jobDescriptionText.trim().length < 50) {
      return { data: null, error: "Please provide a complete job description (at least 50 characters)." };
    }

    const result = await generateFitReport({
      resumeText,
      jobDescriptionText,
    });
    
    return { data: result, error: null };

  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "An unexpected error occurred during analysis." };
  }
}
