
"use server";
import { generateFitReport, type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import mammoth from "mammoth";


async function getTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tryParsePdf = async () => {
    try {
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      return data.text;
    } catch (pdfError) {
      console.warn("PDF parsing failed:", pdfError);
      return null;
    }
  };

  const tryParseDocx = async () => {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (docxError) {
      console.warn("DOCX parsing failed:", docxError);
      return null;
    }
  };

  const tryParseText = () => {
    try {
      return buffer.toString("utf-8");
    } catch (textError) {
        console.warn("Text parsing failed:", textError);
        return null;
    }
  }

  let text: string | null = null;

  if (file.type === "application/pdf") {
    text = await tryParsePdf() || await tryParseDocx();
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword") {
    text = await tryParseDocx() || await tryParsePdf();
  } else if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
    text = tryParseText();
  } else {
    // Fallback for unknown types
    text = await tryParsePdf() || await tryParseDocx() || tryParseText();
  }
  
  if (text !== null) {
    return text;
  }

  console.error(`All parsing attempts failed for file type: ${file.type}`);
  throw new Error("Failed to read file. Please ensure it is not corrupted and is a supported format.");
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

