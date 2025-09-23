"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-error focus-visible:ring-error",
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
      },
      size: {
        default: "min-h-[80px]",
        sm: "min-h-[60px] text-sm",
        lg: "min-h-[120px]",
        xl: "min-h-[160px] text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    variant, 
    size,
    label,
    error,
    success,
    warning,
    helperText,
    maxLength,
    showCharCount = false,
    value,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasMessage = error || success || warning || helperText;
    const messageId = hasMessage ? `${textareaId}-message` : undefined;
    
    // Determine variant based on state
    const effectiveVariant = error ? "error" : success ? "success" : warning ? "warning" : variant;
    
    // Calculate character count
    const currentLength = typeof value === "string" ? value.length : 0;
    const showCount = showCharCount && maxLength;
    
    const textareaElement = (
      <textarea
        className={cn(textareaVariants({ variant: effectiveVariant, size, className }))}
        ref={ref}
        id={textareaId}
        aria-describedby={messageId}
        aria-invalid={error ? "true" : "false"}
        maxLength={maxLength}
        value={value}
        {...props}
      />
    );

    if (!label && !hasMessage && !showCount) {
      return textareaElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label 
              htmlFor={textareaId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
            {showCount && (
              <span className={cn(
                "text-xs text-muted-foreground",
                maxLength && currentLength > maxLength * 0.9 && "text-warning",
                maxLength && currentLength >= maxLength && "text-error"
              )}>
                {currentLength}{maxLength && `/${maxLength}`}
              </span>
            )}
          </div>
        )}
        {textareaElement}
        {hasMessage && (
          <p 
            id={messageId}
            className={cn(
              "text-sm",
              error && "text-error",
              success && "text-success",
              warning && "text-warning",
              !error && !success && !warning && "text-muted-foreground"
            )}
          >
            {error || success || warning || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea, textareaVariants };