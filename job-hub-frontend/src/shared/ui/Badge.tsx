// src/shared/ui/Badge.tsx
import type { HTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<HTMLAttributes<HTMLSpanElement>>;

export default function Badge({ className = "", children, ...props }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
