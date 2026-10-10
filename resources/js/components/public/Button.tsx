import * as React from "react";
import { Button as BaseButton, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "./Spinner";
import { type VariantProps } from "class-variance-authority";

export interface PublicButtonProps
  extends React.ComponentProps<typeof BaseButton> {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, PublicButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    // Map our semantic public variants to the ones we added in shadcn button
    const variantMap: Record<NonNullable<PublicButtonProps["variant"]>, VariantProps<typeof buttonVariants>["variant"]> = {
      primary: "public-primary",
      secondary: "public-secondary",
      accent: "public-accent",
    };

    const sizeMap: Record<NonNullable<PublicButtonProps["size"]>, VariantProps<typeof buttonVariants>["size"]> = {
      sm: "public-sm",
      md: "public-md",
      lg: "public-lg",
    };

    return (
      <BaseButton
        ref={ref}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        disabled={disabled || isLoading}
        className={className}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </BaseButton>
    );
  }
);
Button.displayName = "PublicButton";
