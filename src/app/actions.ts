
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import mammoth from "mammoth";


async function getTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    if (file.type === "application/pdf") {
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      return data.text;
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
      return buffer.toString("utf-8");
    } else if (file.type === "application/msword") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read file. Please ensure it is not corrupted and is a supported format.");
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}


export async function analyzeDocuments(formData: FormData): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  let resumeText: string | undefined = formData.get("resumeText") as string;
  const resumeFile = formData.get("resumeFile") as File | null;
  let jobDescriptionText: string | undefined = formData.get("jobDescriptionText") as string;
  const jobDescriptionFile = formData.get("jobDescriptionFile") as File | null;

  try {
    if (resumeFile && resumeFile.size > 0) {
      resumeText = await getTextFromFile(resumeFile);
    }
    if (jobDescriptionFile && jobDescriptionFile.size > 0) {
      jobDescriptionText = await getTextFromFile(jobDescriptionFile);
    }

    if (!resumeText || resumeText.length < 50) {
      return { data: null, error: "Please provide a more detailed resume." };
    }
    if (!jobDescriptionText || jobDescriptionText.length < 50) {
      return { data: null, error: "Please provide a more detailed job description." };
    }

    const result = await generateFitReport({ resumeText, jobDescriptionText });
    return { data: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "An error occurred while analyzing the documents. Please try again." };
  }
}

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
