import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 20H80V40C80 51.0457 71.0457 60 60 60H20V20Z"
        className="fill-primary/50"
      />
      <path
        d="M80 80H20V60C20 48.9543 28.9543 40 40 40H80V80Z"
        className="fill-primary"
      />
    </svg>
  );
};
