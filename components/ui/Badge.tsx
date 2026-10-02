import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-purple-100 text-purple-800",
  muted: "bg-gray-100 text-gray-600",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
