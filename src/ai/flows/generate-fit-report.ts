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
    overallAnalysis: z.object({
        matchScore: z.number().describe('A score from 0 to 100 representing the overall match.'),
        fit: z.string().describe('A one-word assessment of the fit (e.g., "Moderate", "Strong", "Weak").'),
        summary: z.string().describe('A concise summary of the candidate\'s fit for the role.'),
    }),
    technicalSkills: z.object({
        score: z.number().describe('A score from 0 to 100 for technical skills.'),
        matchedSkills: z.array(z.string()).describe('A list of technical skills from the resume that match the job description.'),
        missingSkills: z.array(z.string()).describe('A list of technical skills required by the job description that are missing from the resume.'),
    }),
    experience: z.object({
        score: z.number().describe('A score from 0 to 100 for experience.'),
        candidateExperience: z.string().describe('A human-readable string of the experience detected in the resume (e.g., "6 months", "2 years", "5 years and 3 months").'),
        requiredExperience: z.string().optional().describe('A human-readable string of the experience required by the job description.'),
        level: z.string().describe('The detected experience level of the candidate (e.g., "Entry", "Mid-Level", "Senior").'),
        fit: z.string().describe('A short assessment of the experience fit (e.g., "Meets Requirement", "Below Requirement").'),
    }),
    roleFit: z.object({
        score: z.number().describe('A score from 0 to 100 for role fit.'),
        currentRole: z.string().describe('The current or most recent role of the candidate.'),
        targetRole: z.string().describe('The target role from the job description.'),
        alignment: z.string().describe('An assessment of the role alignment (e.g., "Excellent", "Good", "Poor").'),
    }),
    education: z.object({
        score: z.number().describe('A score from 0 to 100 for education.'),
        degree: z.string().describe('The highest relevant degree obtained by the candidate.'),
        requiredDegree: z.string().optional().describe('The degree required by the job description.'),
    }),
    certifications: z.object({
        score: z.number().describe('A score from 0 to 100 for certifications match.'),
        matchedCertifications: z.array(z.string()).describe('A list of certifications from the resume that match the job description.'),
        missingCertifications: z.array(z.string()).describe('A list of certifications required by the job description that are missing from the resume.'),
    }).optional().describe("An analysis of certifications, only if mentioned in the job description."),
    summaryReport: z.object({
        strengths: z.array(z.string()).describe('A list of key strengths of the candidate.'),
        weaknesses: z.array(z.string()).describe('A list of key weaknesses or areas for improvement.'),
        finalVerdict: z.string().describe('A final recommendation or verdict on the candidate\'s suitability.'),
    }),
    recommendations: z.array(z.string()).describe("A list of actionable recommendations for the candidate to improve their fit."),
    considerations: z.array(z.string()).describe("A list of key considerations for the hiring manager or recruiter."),
});
export type GenerateFitReportOutput = z.infer<typeof GenerateFitReportOutputSchema>;

export async function generateFitReport(input: GenerateFitReportInput): Promise<GenerateFitReportOutput> {
  return generateFitReportFlow(input);
}

const generateFitReportPrompt = ai.definePrompt({
  name: 'generateFitReportPrompt',
  input: {schema: GenerateFitReportInputSchema},
  output: {schema: GenerateFitReportOutputSchema},
  prompt: `You are an AI-powered career coach specializing in resume analysis. Analyze the user's resume and a job description to provide a detailed, structured report.

  Resume:
  {{resumeText}}

  Job Description:
  {{jobDescriptionText}}

  Instructions:
  1.  **Overall Analysis**: Calculate an overall match score (0-100). Provide a one-word fit assessment (e.g., "Strong", "Moderate", "Weak") and a brief summary.
  2.  **Technical Skills**: Score the technical skills match (0-100). List the skills that match the job description and those that are required but missing. A skill is "matched" only if it appears in BOTH the resume and the job description. Any matched skill MUST NOT appear in the missing list.
  3.  **Experience**: Score the experience match (0-100). Extract the candidate's years of experience and compare it to what's required (if specified). Determine the candidate's experience level (e.g., "Entry", "Mid-Level", "Senior"). IMPORTANT: Express the candidate's experience and the required experience in human-readable strings like "6 months", "1 year and 6 months", or "5 years". Do not use fractional years like "0.83 years". If years of experience are not specified in the job description, set the 'requiredExperience' field to "Not specified" and do not attempt to guess or infer a number.
  4.  **Role Fit**: Score the role fit (0-100). Identify the candidate's current role and the target role. Assess the alignment between them.
  5.  **Education**: Score the education match (0-100). Identify the candidate's highest degree and the required degree (if specified). A 100% score should only be given for an exact match. If the candidate's degree is a related but not identical field (e.g., B.Tech vs B.Sc), assign a lower score to reflect the difference. If the degrees are completely unrelated, the score should be very low.
  6.  **Certifications (Conditional)**: If the job description mentions specific certifications (e.g., PMP, AWS Certified Developer), create a 'certifications' object. Score the match (0-100), list matched certifications, and list missing certifications. A certification is "matched" ONLY if it appears in BOTH the resume and the job description. When listing a matched certification, use the full name from the resume. Any matched certification MUST NOT appear in the missing list. If certifications are not mentioned in the JD, OMIT this object from the output.
  7.  **Summary Report**: Provide a list of key strengths, weaknesses, and a final verdict on the candidate's suitability.
  8.  **Recommendations**: Provide a list of actionable recommendations for the candidate to improve their fit for this role or future roles.
  9. **Considerations**: Provide a list of key points for a hiring manager to consider when evaluating this candidate.

  Provide your analysis in the structured JSON format.`,
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
