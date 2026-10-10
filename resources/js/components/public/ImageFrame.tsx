import * as React from "react";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageFrameProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "16/10" | "4/3" | "3/4" | "auto";
  alt: string; // explicitly required
  src: string; // explicitly required
  width: number | string; // required
  height: number | string; // required
}

export function ImageFrame({
  aspectRatio = "16/10",
  className,
  src,
  alt,
  width,
  height,
  ...props
}: ImageFrameProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const aspectRatioClass = {
    "16/10": "aspect-[16/10]",
    "4/3": "aspect-[4/3]",
    "3/4": "aspect-[3/4]",
    auto: "aspect-auto",
  }[aspectRatio];

  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", aspectRatioClass, className)}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 z-0 h-full w-full rounded-none" />
      )}
      {hasError && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-neutral-100 text-neutral-400 text-sm">
          Image not available
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />
    </div>
  );
}
