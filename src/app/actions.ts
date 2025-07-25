"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";

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
