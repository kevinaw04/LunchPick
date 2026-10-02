import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  size?: "sm" | "md";
  showLabel?: boolean;
}

const colors = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
};

export function ProgressBar({ value, max = 100, className, color = "blue", size = "md", showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 bg-gray-100 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 w-8 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
