import { highlightTerms, type HighlightedSegment } from "@/utils/highlightTerms";
import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Component that automatically bolds technical terms in text
 */
export const HighlightedText = ({
  text,
  className,
  highlightClassName,
}: HighlightedTextProps) => {
  const segments = highlightTerms(text);

  if (segments.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.isHighlighted) {
          return (
            <strong
              key={index}
              className={cn("font-bold text-foreground", highlightClassName)}
              title={segment.term}
            >
              {segment.text}
            </strong>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
};

