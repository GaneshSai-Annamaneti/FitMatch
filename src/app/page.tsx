
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getFitReport, getTextFromFile } from "@/app/actions";
import { type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Loader2, ThumbsUp, ThumbsDown, Upload } from "lucide-react";
import { ScoreDisplay } from "@/components/score-display";
import { ReportCard } from "@/components/report-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FormSchema = z.object({
  resumeText: z.string().optional(),
  jobDescriptionText: z.string().optional(),
  resumeFile: z.any().optional(),
  jobFile: z.any().optional(),
})
.refine(data => (data.resumeText && data.resumeText.length > 0) || (data.resumeFile && data.resumeFile.length > 0), {
  message: "Please provide a resume as text or upload a file.",
  path: ["resumeText"], 
})
.refine(data => (data.jobDescriptionText && data.jobDescriptionText.length > 0) || (data.jobFile && data.jobFile.length > 0), {
  message: "Please provide a job description as text or upload a file.",
  path: ["jobDescriptionText"],
});


type FormValues = z.infer<typeof FormSchema>;

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<GenerateFitReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      resumeText: "",
      jobDescriptionText: "",
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "resumeFile" | "jobFile",
    setFileName: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue(fieldName, e.target.files);
    } else {
      setFileName("");
      form.setValue(fieldName, null);
    }
  };
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    let resumeText = data.resumeText ?? "";
    let jobDescriptionText = data.jobDescriptionText ?? "";

    try {
      if (data.resumeFile && data.resumeFile.length > 0) {
        const formData = new FormData();
        formData.append('file', data.resumeFile[0]);
        const { data: text, error } = await getTextFromFile(formData);
        if (error || !text) {
          toast({ variant: "destructive", title: "Error reading resume file", description: error || "Could not extract text from file." });
          setIsLoading(false);
          return;
        }
        resumeText = text;
      }

      if (data.jobFile && data.jobFile.length > 0) {
        const formData = new FormData();
        formData.append('file', data.jobFile[0]);
        const { data: text, error } = await getTextFromFile(formData);
        if (error || !text) {
          toast({ variant: "destructive", title: "Error reading job file", description: error || "Could not extract text from file." });
          setIsLoading(false);
          return;
        }
        jobDescriptionText = text;
      }
      
      const { data: result, error } = await getFitReport(resumeText, jobDescriptionText);

      if (error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error,
        });
      } else if (result) {
        setAnalysisResult(result);
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "An unexpected error occurred", description: "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const { errors } = form.formState;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="container mx-auto px-4 py-6 flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">FitMatch.AI</h1>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-foreground">
            Unlock Your Career Potential
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Paste your resume and a job description to get an AI-powered analysis of your fit, instantly.
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>Paste the text of your resume below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your resume..."
                  className="min-h-[260px] text-sm"
                  {...form.register("resumeText")}
                />
                {errors.resumeText && (
                  <p className="text-sm text-destructive mt-2">{errors.resumeText.message}</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the text of the job description below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description..."
                  className="min-h-[260px] text-sm"
                  {...form.register("jobDescriptionText")}
                />
                {errors.jobDescriptionText && (
                  <p className="text-sm text-destructive mt-2">{errors.jobDescriptionText.message}</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button type="submit" size="lg" disabled={isLoading} className="w-full max-w-xs text-base">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Analyzing..." : "Analyze Fit"}
            </Button>
          </div>
        </form>

        {(isLoading || analysisResult) && <Separator className="my-12" />}

        {isLoading && (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <Skeleton className="h-48 w-48 rounded-full" />
              <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-72 w-full rounded-lg" />
                <Skeleton className="h-72 w-full rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="animate-in fade-in-50 duration-500">
            <h3 className="text-3xl font-bold font-headline text-center mb-8">Your Fit Report</h3>
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <ScoreDisplay score={analysisResult.matchScore} className="mt-4 md:mt-0" />
              <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportCard
                  title="Strengths"
                  content={analysisResult.strengths}
                  icon={ThumbsUp}
                  variant="strengths"
                />
                <ReportCard
                  title="Weaknesses"
                  content={analysisResult.weaknesses}
                  icon={ThumbsDown}
                  variant="weaknesses"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} FitMatch.AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
