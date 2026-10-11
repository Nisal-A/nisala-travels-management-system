import * as React from "react";
import { cn } from "cn";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "right" && "ml-auto text-right",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <span className="inline-block bg-brand-gold text-brand-navy text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-brand-navy mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
