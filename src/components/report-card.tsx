import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ReportCardProps {
  title: string;
  content: string;
  icon: LucideIcon;
  variant: "strengths" | "weaknesses";
  className?: string;
}

export function ReportCard({ title, content, icon: Icon, variant, className }: ReportCardProps) {
  const contentItems = content
    .split('\n')
    .map(item => item.trim().replace(/^-/, '').trim())
    .filter(item => item.length > 0);

  return (
    <Card className={cn("w-full shadow-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-headline">
          <div className={cn("p-2 rounded-full", {
              "bg-primary/10 text-primary": variant === "strengths",
              "bg-destructive/10 text-destructive": variant === "weaknesses",
          })}>
            <Icon className="h-6 w-6" />
          </div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 pl-5">
          {contentItems.map((item, index) => (
            <li key={index} className="list-disc text-foreground/80">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
