import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M3 20V4" className="stroke-foreground" />
        <path d="M4 18h2" className="stroke-primary" />
        <path d="M8 15h2" className="stroke-primary" />
        <path d="M12 12h2" className="stroke-primary" />
        <path d="M16 9h2" className="stroke-primary" />
        <path d="M20 6h2" className="stroke-primary" />
    </svg>
  );
};
