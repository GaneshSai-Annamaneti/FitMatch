// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A flow to generate a detailed report highlighting the strengths and weaknesses of a resume in relation to a job description.
 *
 * - generateFitReport - A function that generates the fit report.
 * - GenerateFitReportInput - The input type for the generateFitReport function.
 * - GenerateFitReportOutput - The return type for the generateFitReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFitReportInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type GenerateFitReportInput = z.infer<typeof GenerateFitReportInputSchema>;

const GenerateFitReportOutputSchema = z.object({
  matchScore: z.number().describe('The percentage match between the resume and job description.'),
  strengths: z.string().describe('A detailed report of the resume strengths based on the job description.'),
  weaknesses: z.string().describe('A detailed report of the resume weaknesses based on the job description.'),
});
export type GenerateFitReportOutput = z.infer<typeof GenerateFitReportOutputSchema>;

export async function generateFitReport(input: GenerateFitReportInput): Promise<GenerateFitReportOutput> {
  return generateFitReportFlow(input);
}

const generateFitReportPrompt = ai.definePrompt({
  name: 'generateFitReportPrompt',
  input: {schema: GenerateFitReportInputSchema},
  output: {schema: GenerateFitReportOutputSchema},
  prompt: `You are an AI-powered career coach. You will analyze a user's resume and a job description and provide a detailed report.

  Resume:
  {{resumeText}}

  Job Description:
  {{jobDescriptionText}}

  Instructions:
  1.  Calculate a match score (0-100) representing how well the resume aligns with the job description.
  2.  Identify and describe the strengths of the resume in relation to the job description. Focus on skills, experience, and qualifications that are a good fit.
  3.  Identify and describe the weaknesses of the resume in relation to the job description. Highlight any gaps or areas where the resume is lacking.`,
});

const generateFitReportFlow = ai.defineFlow(
  {
    name: 'generateFitReportFlow',
    inputSchema: GenerateFitReportInputSchema,
    outputSchema: GenerateFitReportOutputSchema,
  },
  async input => {
    const {output} = await generateFitReportPrompt(input);
    return output!;
  }
);
