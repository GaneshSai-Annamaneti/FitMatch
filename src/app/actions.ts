
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import mammoth from "mammoth";

async function getTextFromFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error(`File "${file.name}" is empty or invalid.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`Failed to read content from file "${file.name}".`);
  }
  
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
  const isDoc = file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc");
  const isText = file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt");

  try {
    if (isPdf) {
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      return data.text;
    } else if (isDocx || isDoc) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else if (isText) {
      return buffer.toString("utf-8");
    }
  } catch (error: any) {
    console.error(`Error parsing file ${file.name} with type ${file.type}:`, error);
    throw new Error(`Failed to parse file "${file.name}". It might be corrupted or in an unsupported format.`);
  }
  
  throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload a DOCX, PDF, TXT, MD, or CSV file.`);
}

export async function analyzeDocuments(formData: FormData): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  let resumeContent: string | undefined;
  let jobDescriptionContent: string | undefined;

  try {
    const resumeFile = formData.get("resumeFile") as File | null;
    const resumeText = formData.get("resumeText") as string | null;

    if (resumeFile && resumeFile.size > 0) {
      resumeContent = await getTextFromFile(resumeFile);
    } else if (resumeText) {
      resumeContent = resumeText;
    }

    const jobDescriptionFile = formData.get("jobDescriptionFile") as File | null;
    const jobDescriptionText = formData.get("jobDescriptionText") as string | null;

    if (jobDescriptionFile && jobDescriptionFile.size > 0) {
      jobDescriptionContent = await getTextFromFile(jobDescriptionFile);
    } else if (jobDescriptionText) {
      jobDescriptionContent = jobDescriptionText;
    }

    if (!resumeContent || resumeContent.trim().length < 50) {
      return { data: null, error: "Please provide a complete resume (at least 50 characters)." };
    }
    if (!jobDescriptionContent || jobDescriptionContent.trim().length < 50) {
      return { data: null, error: "Please provide a complete job description (at least 50 characters)." };
    }

    const result = await generateFitReport({
      resumeText: resumeContent,
      jobDescriptionText: jobDescriptionContent,
    });
    
    return { data: result, error: null };

  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "An unexpected error occurred during analysis." };
  }
}
