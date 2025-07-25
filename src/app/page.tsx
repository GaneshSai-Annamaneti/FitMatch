"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import mammoth from "mammoth";
import { getFitReport } from "@/app/actions";
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
  resumeText: z.string().min(100, "Please provide a resume as text (min 100 chars)."),
  jobDescriptionText: z.string().min(100, "Please provide a job description as text (min 100 chars)."),
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

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (file.name.endsWith('.docx')) {
          mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer })
            .then(result => resolve(result.value))
            .catch(reject);
        } else {
          resolve(reader.result as string);
        }
      };
      reader.onerror = () => reject(reader.error);
      
      if (file.name.endsWith('.docx')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    fieldName: keyof FormValues,
    setFileName: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const text = await readFileAsText(file);
        form.setValue(fieldName, text, { shouldValidate: true });
      } catch (err) {
        toast({ variant: "destructive", title: `Error reading ${fieldName} file`, description: "Could not read the provided file." });
        setFileName("");
      }
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const { data: result, error } = await getFitReport(data.resumeText, data.jobDescriptionText);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error,
      });
    } else if (result) {
      setAnalysisResult(result);
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
                <CardDescription>Paste the text or upload a file.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-4">
                    <Textarea
                      placeholder="Paste your resume..."
                      className="min-h-[260px] text-sm"
                      {...form.register("resumeText")}
                    />
                  </TabsContent>
                  <TabsContent value="file" className="mt-4">
                    <Label htmlFor="resumeFile" className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[260px] border-2 border-dashed rounded-lg">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">TXT, DOCX</p>
                        {resumeFileName && <p className="text-xs text-primary mt-2">{resumeFileName}</p>}
                      </div>
                      <Input id="resumeFile" type="file" className="hidden" accept=".txt,.docx" onChange={(e) => handleFileChange(e, "resumeText", setResumeFileName)} />
                    </Label>
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
                <CardDescription>Paste the text or upload a file.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-4">
                    <Textarea
                      placeholder="Paste the job description..."
                      className="min-h-[260px] text-sm"
                      {...form.register("jobDescriptionText")}
                    />
                  </TabsContent>
                  <TabsContent value="file" className="mt-4">
                    <Label htmlFor="jobFile" className="cursor-pointer flex flex-col items-center justify-center w-full min-h-[260px] border-2 border-dashed rounded-lg">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">TXT, DOCX</p>
                        {jobFileName && <p className="text-xs text-primary mt-2">{jobFileName}</p>}
                      </div>
                      <Input id="jobFile" type="file" className="hidden" accept=".txt,.docx" onChange={(e) => handleFileChange(e, "jobDescriptionText", setJobFileName)} />
                    </Label>
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