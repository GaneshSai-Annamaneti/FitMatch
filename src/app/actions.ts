
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";

async function getTextFromFile(file: File): Promise<string> {
  // 1. Check for empty file
  if (!file || file.size === 0) {
    throw new Error(`File "${file.name}" is empty or invalid.`);
  }

  // 2. Read file into a buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Double-check buffer is not empty before parsing
  if (buffer.length === 0) {
    throw new Error(`Failed to read content from file "${file.name}".`);
  }
  
  // 4. For now, we will only support text-based files.
  if (file.type.startsWith('text/') || file.type === 'application/octet-stream') {
      const text = buffer.toString("utf-8");
      if(text) return text;
  }

  // If we get here, the file type is not supported.
  throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload a plain text file (.txt, .md). PDF and DOCX are not currently supported.`);
}


export async function analyzeDocuments(formData: FormData): Promise<{ data: GenerateFitReportOutput | null; error: string | null }> {
  let resumeContent: string | undefined = formData.get("resumeText") as string | undefined;
  const resumeFile = formData.get("resumeFile") as File | null;
  let jobDescriptionContent: string | undefined = formData.get("jobDescriptionText") as string | undefined;
  const jobDescriptionFile = formData.get("jobDescriptionFile") as File | null;

  try {
    // Determine resume content
    if (resumeFile && resumeFile.size > 0) {
      resumeContent = await getTextFromFile(resumeFile);
    }

    // Determine job description content
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

    // Call the AI model
    const result = await generateFitReport({ 
        resumeText: resumeContent, 
        jobDescriptionText: jobDescriptionContent 
    });
    return { data: result, error: null };
    
  } catch (e: any) {
    console.error(e);
    // Provide a more specific error if it's our custom file reading error
    if (e.message.startsWith('Unsupported file type') || e.message.startsWith('File "')) {
        return { data: null, error: e.message };
    }
    // Generic error for anything else
    return { data: null, error: "An error occurred while analyzing the documents. The file might be corrupted or in an unsupported format." };
  }
}
