import type { ReactNode } from "react";

export function SectionHeading({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-white mb-4">
      <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand/20 text-brand shrink-0">
        {icon}
      </span>
      {children}
    </h2>
  );
}