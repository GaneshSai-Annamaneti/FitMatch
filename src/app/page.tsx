"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { analyzeDocuments } from "@/app/actions";
import { type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { ScoreDisplay } from "@/components/score-display";
import { ReportCard } from "@/components/report-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fileSchema = z.custom<FileList>().transform(file => file.length > 0 ? file.item(0) : null).nullable();

const FormSchema = z.object({
  resumeText: z.string().optional(),
  resumeFile: fileSchema,
  jobDescriptionText: z.string().optional(),
  jobDescriptionFile: fileSchema,
}).superRefine((data, ctx) => {
    if (!data.resumeText && !data.resumeFile) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide a resume by text or file.", path: ["resumeText"] });
    }
     if (data.resumeText && data.resumeText.length < 50) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide a more detailed resume.", path: ["resumeText"] });
    }
    if (!data.jobDescriptionText && !data.jobDescriptionFile) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide a job description by text or file.", path: ["jobDescriptionText"] });
    }
    if (data.jobDescriptionText && data.jobDescriptionText.length < 50) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide a more detailed job description.", path: ["jobDescriptionText"] });
    }
});


type FormValues = z.infer<typeof FormSchema>;

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<GenerateFitReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      resumeText: "",
      jobDescriptionText: "",
      resumeFile: null,
      jobDescriptionFile: null
    },
  });
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      if (data.resumeText) formData.append("resumeText", data.resumeText);
      if (data.resumeFile) formData.append("resumeFile", data.resumeFile as File);
      if (data.jobDescriptionText) formData.append("jobDescriptionText", data.jobDescriptionText);
      if (data.jobDescriptionFile) formData.append("jobDescriptionFile", data.jobDescriptionFile as File);
      
      const { data: result, error } = await analyzeDocuments(formData);

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
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="text">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="file">File Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="mt-4">
                            <CardDescription className="mb-2">Paste the text of your resume below.</CardDescription>
                            <Textarea
                                placeholder="Paste your resume..."
                                className="min-h-[260px] text-sm"
                                {...form.register("resumeText")}
                                />
                        </TabsContent>
                        <TabsContent value="file" className="mt-4">
                            <CardDescription className="mb-2">Upload your resume file.</CardDescription>
                             <Input type="file" {...form.register("resumeFile")} accept=".pdf,.doc,.docx,.txt,.md,.csv" />
                        </TabsContent>
                    </Tabs>
                    {errors.resumeText && (
                        <p className="text-sm text-destructive mt-2">{errors.resumeText.message}</p>
                    )}
                </CardContent>
            </Card>
            <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="text">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="file">File Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="mt-4">
                            <CardDescription className="mb-2">Paste the job description below.</CardDescription>
                            <Textarea
                                placeholder="Paste the job description..."
                                className="min-h-[260px] text-sm"
                                {...form.register("jobDescriptionText")}
                                />
                        </TabsContent>
                        <TabsContent value="file" className="mt-4">
                             <CardDescription className="mb-2">Upload the job description file.</CardDescription>
                             <Input type="file" {...form.register("jobDescriptionFile")} accept=".pdf,.doc,.docx,.txt,.md,.csv" />
                        </TabsContent>
                    </Tabs>
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
