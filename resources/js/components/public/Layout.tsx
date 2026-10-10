import * as React from "react";
import { cn } from "cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {}

export function Section({ className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-16 md:py-24 lg:py-32", className)}
      {...props}
    />
  );
}

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl", className)}
      {...props}
    />
  );
}
