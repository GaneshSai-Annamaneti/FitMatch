
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import mammoth from "mammoth";
import pdf from "pdf-parse";


async function getTextFromFile(file: File): Promise<string> {
  // Ensure the file is not empty to prevent parsing errors
  if (!file || file.size === 0) {
    throw new Error(`File "${file.name}" is empty or invalid.`);
  }
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Double-check buffer has content
  if (buffer.length === 0) {
    throw new Error(`Failed to read content from file "${file.name}".`);
  }

  try {
    if (file.type === "application/pdf") {
      const data = await pdf(buffer);
      if(data.text) return data.text;
    } 
    
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword") {
      const result = await mammoth.extractRawText({ buffer });
      if(result.value) return result.value;
    }
    
    // Fallback for text-based files like .txt, .md, .csv
    const text = buffer.toString("utf-8");
    if(text) return text;

  } catch (error) {
    console.error(`Error parsing file ${file.name} of type ${file.type}:`, error);
    // Let the final error handler catch this
  }

  throw new Error(`Failed to read file. The format may be unsupported or the file could be corrupted.`);
}


export async function analyzeDocuments(formData: FormData): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  let resumeContent: string | undefined = formData.get("resumeText") as string | undefined;
  const resumeFile = formData.get("resumeFile") as File | null;
  let jobDescriptionContent: string | undefined = formData.get("jobDescriptionText") as string | undefined;
  const jobDescriptionFile = formData.get("jobDescriptionFile") as File | null;

  try {
    // Determine final content for resume
    if (resumeFile && resumeFile.size > 0) {
      resumeContent = await getTextFromFile(resumeFile);
    }

    // Determine final content for job description
    if (jobDescriptionFile && jobDescriptionFile.size > 0) {
      jobDescriptionContent = await getTextFromFile(jobDescriptionFile);
    }

    // Validate that we have content for both
    if (!resumeContent || resumeContent.trim().length < 50) {
      return { data: null, error: "Please provide a complete resume (at least 50 characters)." };
    }
    if (!jobDescriptionContent || jobDescriptionContent.trim().length < 50) {
      return { data: null, error: "Please provide a complete job description (at least 50 characters)." };
    }

    const result = await generateFitReport({ 
        resumeText: resumeContent, 
        jobDescriptionText: jobDescriptionContent 
    });
    return { data: result, error: null };
    
  } catch (e: any) {
    console.error(e);
    // Provide a more specific error if it's our custom file reading error
    if (e.message.startsWith('Failed to read file') || e.message.startsWith('File "')) {
        return { data: null, error: e.message };
    }
    return { data: null, error: "An error occurred while analyzing the documents. Please try again." };
  }
}
