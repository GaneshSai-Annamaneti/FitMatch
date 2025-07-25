import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ReportCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function ReportCard({ title, icon: Icon, children, className }: ReportCardProps) {
  return (
    <Card className={cn("w-full shadow-sm bg-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground/90">
            <Icon className="h-6 w-6 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
