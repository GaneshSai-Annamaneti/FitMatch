import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M4 14H8V20H4V14Z"
            className="fill-primary"
        />
        <path
            d="M10 10H14V20H10V10Z"
            className="fill-primary"
        />
        <path
            d="M16 6H20V20H16V6Z"
            className="fill-primary"
        />
        <path
            d="M4 12L10 6L16 2L20 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
        />
    </svg>
  );
};
