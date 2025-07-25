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
        d="M5 14.5C5 13.6716 5.67157 13 6.5 13H17.5C18.3284 13 19 13.6716 19 14.5V19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5V14.5Z"
        className="fill-primary"
      />
      <path
        d="M5 6.5C5 5.67157 5.67157 5 6.5 5H17.5C18.3284 5 19 5.67157 19 6.5V11.5C19 12.3284 18.3284 13 17.5 13H6.5C5.67157 13 5 12.3284 5 11.5V6.5Z"
        className="fill-primary/50"
      />
      <path
        d="M8 3.5C8 3.22386 8.22386 3 8.5 3H15.5C15.7761 3 16 3.22386 16 3.5V5H8V3.5Z"
        className="fill-primary/30"
      />
    </svg>
  );
};
