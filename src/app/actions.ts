
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";

async function getTextFromFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error(`File "${file.name}" is empty or invalid.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();
  
  try {
    if (fileName.endsWith('.pdf')) {
      const pdfParse = await import('pdf-parse');
      const pdf = pdfParse.default || pdfParse;
      const data = await pdf(buffer);
      return data.text;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileName.endsWith('.txt')) {
      return buffer.toString("utf-8");
    }
  } catch (error: any) {
    console.error(`Error parsing file ${file.name}:`, error);
    throw new Error(`Failed to parse file "${file.name}". It might be corrupted or in an unsupported format.`);
  }
  
  throw new Error(`Unsupported file type for "${file.name}". Please upload a PDF, DOCX, DOC, or TXT file.`);
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

    