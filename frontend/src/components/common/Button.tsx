import React from "react";

type Variant = "primary" | "secondary";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300"
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm"
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
};

