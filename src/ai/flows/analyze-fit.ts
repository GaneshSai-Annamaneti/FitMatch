// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Analyzes the fit between a resume and a job description.
 *
 * - analyzeFit - A function that handles the fit analysis process.
 * - AnalyzeFitInput - The input type for the analyzeFit function.
 * - AnalyzeFitOutput - The return type for the analyzeFit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFitInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type AnalyzeFitInput = z.infer<typeof AnalyzeFitInputSchema>;

const AnalyzeFitOutputSchema = z.object({
  matchScore: z.number().describe('The percentage match between the resume and job description.'),
  report: z.string().describe('A detailed report of the resume\s strengths and weaknesses based on the job description.'),
});
export type AnalyzeFitOutput = z.infer<typeof AnalyzeFitOutputSchema>;

export async function analyzeFit(input: AnalyzeFitInput): Promise<AnalyzeFitOutput> {
  return analyzeFitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFitPrompt',
  input: {schema: AnalyzeFitInputSchema},
  output: {schema: AnalyzeFitOutputSchema},
  prompt: `You are a resume and job description matching expert. Given a resume and a job description, you will provide a match score (as a percentage) and a detailed report of the resume\'s strengths and weaknesses based on the job description.

Resume:
{{resumeText}}

Job Description:
{{jobDescriptionText}}`,
});

const analyzeFitFlow = ai.defineFlow(
  {
    name: 'analyzeFitFlow',
    inputSchema: AnalyzeFitInputSchema,
    outputSchema: AnalyzeFitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
