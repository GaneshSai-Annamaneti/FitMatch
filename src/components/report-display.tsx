import type { GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Briefcase, GraduationCap, Wrench, Rocket, Clock } from "lucide-react";
import { ReportCard } from "./report-card";

interface ReportDisplayProps {
    report: GenerateFitReportOutput;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
    const { overallAnalysis, technicalSkills, experience, roleFit, education } = report;

    const getFitColor = (fit: string) => {
        switch (fit.toLowerCase()) {
            case "strong":
            case "excellent":
            case "meets requirement":
                return "bg-green-500 hover:bg-green-500";
            case "moderate":
            case "good":
                return "bg-yellow-500 hover:bg-yellow-500";
            default:
                return "bg-red-500 hover:bg-red-500";
        }
    }

    return (
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold">Comprehensive Candidate Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <div className="flex items-center gap-4">
                        <p className="text-7xl font-bold text-primary">{overallAnalysis.matchScore}%</p>
                        <div className="text-left">
                            <p className="text-muted-foreground">Overall Match</p>
                            <Badge className={cn("text-base", getFitColor(overallAnalysis.fit))}>{overallAnalysis.fit}</Badge>
                        </div>
                    </div>
                    <p className="text-center text-muted-foreground max-w-2xl">{overallAnalysis.summary}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <ReportCard title={`Technical Skills (${technicalSkills.score}%)`} icon={Wrench}>
                    <div className="space-y-4">
                        <Progress value={technicalSkills.score} />
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Matched Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {technicalSkills.matchedSkills.map(skill => <Badge variant="secondary" key={skill}>{skill}</Badge>)}
                            </div>
                        </div>
                    </div>
                </ReportCard>

                <ReportCard title={`Experience (${experience.score}%)`} icon={Clock}>
                     <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <div><span className="font-semibold">Candidate:</span> {experience.candidateYears} years</div>
                            <div><span className="font-semibold">Required:</span> {experience.requiredYears ? `${experience.requiredYears} years` : 'Not specified'}</div>
                        </div>
                        <Progress value={(experience.candidateYears / (experience.requiredYears || experience.candidateYears || 1)) * 100} />
                        <div className="flex justify-between items-center text-sm">
                            <div><span className="font-semibold">Level:</span> <Badge variant="outline">{experience.level}</Badge></div>
                            <div><span className="font-semibold">Fit:</span> <Badge className={getFitColor(experience.fit)}>{experience.fit}</Badge></div>
                        </div>
                    </div>
                </ReportCard>
                
                <ReportCard title={`Role Fit (${roleFit.score}%)`} icon={Briefcase}>
                    <div className="space-y-3">
                        <Progress value={roleFit.score} />
                        <div className="text-sm space-y-1">
                            <p><span className="font-semibold text-muted-foreground">Current Role:</span> {roleFit.currentRole}</p>
                            <p><span className="font-semibold text-muted-foreground">Target Role:</span> {roleFit.targetRole}</p>
                        </div>
                        <div className="text-sm"><span className="font-semibold">Alignment:</span> <Badge className={cn(getFitColor(roleFit.alignment))}>{roleFit.alignment}</Badge></div>
                    </div>
                </ReportCard>
                
                <ReportCard title={`Education (${education.score}%)`} icon={GraduationCap}>
                    <div className="space-y-3">
                        <Progress value={education.score} />
                        <div className="text-sm space-y-1">
                            <p><span className="font-semibold text-muted-foreground">Degree:</span> {education.degree}</p>
                            {education.requiredDegree && <p><span className="font-semibold text-muted-foreground">Required:</span> {education.requiredDegree}</p>}
                        </div>
                    </div>
                </ReportCard>
            </div>
        </div>
    );
}