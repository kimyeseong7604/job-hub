// src/shared/ui/Button.tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
>;

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  default: "bg-gray-900 text-white hover:bg-gray-800",
  outline: "border border-gray-300 bg-white hover:bg-gray-50",
  ghost: "bg-transparent hover:bg-gray-100",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export default function Button({
  variant = "outline",
  size = "md",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
