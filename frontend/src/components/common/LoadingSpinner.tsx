import React from "react";

export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const px = size === "sm" ? 16 : size === "lg" ? 40 : 24;
  return (
    <div
      className="animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{ width: px, height: px }}
      aria-label="Loading"
    />
  );
};

