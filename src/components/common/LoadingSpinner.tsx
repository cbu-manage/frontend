"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md";
  colorClassName?: string;
}

export default function LoadingSpinner({
  size = "sm",
  colorClassName = "border-white",
}: LoadingSpinnerProps) {
  const sizeClass =
    size === "sm" ? "w-4 h-4 border-2" : "w-6 h-6 border-2";

  return (
    <span
      className={`inline-block animate-spin rounded-full border-t-transparent ${sizeClass} ${colorClassName}`}
    />
  );
}

