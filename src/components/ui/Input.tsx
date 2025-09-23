"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-error focus-visible:ring-error",
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-2 text-sm",
        lg: "h-11 px-4 py-3",
        xl: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text",
    label,
    error,
    success,
    warning,
    helperText,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
     const inputId = id || generatedId;
     
     const hasMessage = error || success || warning || helperText;
     const messageId = hasMessage ? `${inputId}-message` : undefined;
    
    // Determine variant based on state
    const effectiveVariant = error ? "error" : success ? "success" : warning ? "warning" : variant;
    
    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant: effectiveVariant, size, className }),
            leftIcon && "pl-10",
            rightIcon && "pr-10"
          )}
          ref={ref}
          id={inputId}
          aria-describedby={messageId}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (!label && !hasMessage) {
      return inputElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        {inputElement}
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

Input.displayName = "Input";

export { Input, inputVariants };