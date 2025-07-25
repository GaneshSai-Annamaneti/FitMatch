import type { GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Briefcase, GraduationCap, Wrench, Clock, Lightbulb, AlertTriangle, Target, Medal, ThumbsDown, FileText, Smile, Star } from "lucide-react";
import { ReportCard } from "./report-card";

interface ReportDisplayProps {
    report: GenerateFitReportOutput;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
    const { overallAnalysis, technicalSkills, experience, roleFit, education, certifications, summaryReport, recommendations, considerations } = report;

    const getFitColor = (fit: string) => {
        const lowerFit = fit.toLowerCase();
        if (["strong", "excellent", "meets requirement"].some(term => lowerFit.includes(term))) {
            return "bg-green-500 hover:bg-green-500";
        }
        if (["moderate", "good"].some(term => lowerFit.includes(term))) {
            return "bg-yellow-500 hover:bg-yellow-500";
        }
        return "bg-red-500 hover:bg-red-500";
    }

    const ListItem = ({ children, icon: Icon, colorClass }: { children: React.ReactNode, icon: React.ElementType, colorClass?: string }) => (
        <li className="flex items-start gap-3">
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", colorClass)} />
            <span className="text-muted-foreground">{children}</span>
        </li>
    );
    
    const SkillsOrCertsCard = ({
        title,
        icon,
        data,
    }: {
        title: string,
        icon: React.ElementType,
        data: { score: number; matchedSkills: string[]; missingSkills: string[] } | { score: number; matchedCertifications: string[]; missingCertifications: string[] },
    }) => {
         const matchedItems = 'matchedSkills' in data ? data.matchedSkills : data.matchedCertifications;
         const missingItems = 'missingSkills' in data ? data.missingSkills : data.missingCertifications;

        return (
             <ReportCard title={`${title} (${data.score}%)`} icon={icon}>
                <div className="space-y-4">
                    <Progress value={data.score} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Matched</h4>
                            <div className="flex flex-wrap gap-2">
                                {matchedItems.length > 0 ? 
                                    matchedItems.map(item => <Badge variant="secondary" key={item}>{item}</Badge>) :
                                    <p className="text-sm text-muted-foreground">None found.</p>
                                }
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><XCircle className="h-4 w-4 text-red-500" /> Missing</h4>
                            <div className="flex flex-wrap gap-2">
                                 {missingItems.length > 0 ? 
                                    missingItems.map(item => <Badge variant="destructive" key={item}>{item}</Badge>) :
                                    <p className="text-sm text-muted-foreground">None required.</p>
                                 }
                            </div>
                        </div>
                    </div>
                </div>
            </ReportCard>
        )
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ReportCard title="Summary Report" icon={FileText} className="lg:col-span-1">
                    <ul className="space-y-4 text-sm">
                        <ListItem icon={Medal} colorClass="text-green-500">
                            <strong>Strengths:</strong> {summaryReport.strengths.join(", ")}
                        </ListItem>
                        <ListItem icon={ThumbsDown} colorClass="text-red-500">
                           <strong>Weaknesses:</strong> {summaryReport.weaknesses.join(", ")}
                        </ListItem>
                        <ListItem icon={Target} colorClass="text-primary">
                            <strong>Final Verdict:</strong> {summaryReport.finalVerdict}
                        </ListItem>
                    </ul>
                </ReportCard>
                 <ReportCard title="Recommendations" icon={Lightbulb} className="lg:col-span-1">
                    <ul className="space-y-3 text-sm">
                        {recommendations.map((rec, i) => <ListItem key={i} icon={CheckCircle2} colorClass="text-green-500">{rec}</ListItem>)}
                    </ul>
                </ReportCard>
                <ReportCard title="Considerations for Recruiter" icon={AlertTriangle} className="lg:col-span-1">
                     <ul className="space-y-3 text-sm">
                        {considerations.map((con, i) => <ListItem key={i} icon={CheckCircle2} colorClass="text-yellow-500">{con}</ListItem>)}
                    </ul>
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 <SkillsOrCertsCard 
                    title="Technical Skills"
                    icon={Wrench}
                    data={{
                        score: technicalSkills.score,
                        matchedSkills: technicalSkills.matchedSkills,
                        missingSkills: technicalSkills.missingSkills,
                    }}
                />

                <ReportCard title={`Experience (${experience.score}%)`} icon={Clock}>
                     <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <div><span className="font-semibold">Candidate:</span> {experience.candidateExperience}</div>
                            <div><span className="font-semibold">Required:</span> {experience.requiredExperience ? experience.requiredExperience : 'Not specified'}</div>
                        </div>
                        <Progress value={experience.score} />
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

                {certifications && (
                    <SkillsOrCertsCard 
                        title="Certifications"
                        icon={Star}
                        data={{
                            score: certifications.score,
                            matchedCertifications: certifications.matchedCertifications,
                            missingCertifications: certifications.missingCertifications,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
