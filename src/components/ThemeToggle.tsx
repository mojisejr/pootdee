"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Icons as SVG components for better performance and customization
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("h-4 w-4", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591"
    />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("h-4 w-4", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
);

const SystemIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("h-4 w-4", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    />
  </svg>
);

export interface ThemeToggleProps {
  variant?: "button" | "dropdown";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = "button", 
  size = "default", 
  showLabel = false,
  className 
}: ThemeToggleProps): JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState<boolean>(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
        className={cn("animate-pulse", className)}
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="h-4 w-4 rounded-full bg-muted" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    );
  }

  const cycleTheme = (): void => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = (): JSX.Element => {
    if (theme === "system") {
      return <SystemIcon />;
    }
    return resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />;
  };

  const getThemeLabel = (): string => {
    if (theme === "system") {
      return "System";
    }
    return resolvedTheme === "dark" ? "Dark" : "Light";
  };

  const getAriaLabel = (): string => {
    const currentTheme = theme === "system" ? "system" : resolvedTheme;
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    return `Switch from ${currentTheme} to ${nextTheme} theme`;
  };

  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          onClick={cycleTheme}
          aria-label={getAriaLabel()}
          className="gap-2"
        >
          {getThemeIcon()}
          {showLabel && <span>{getThemeLabel()}</span>}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      className={cn(showLabel && "gap-2", className)}
    >
      {getThemeIcon()}
      {showLabel && <span>{getThemeLabel()}</span>}
    </Button>
  );
}

ThemeToggle.displayName = "ThemeToggle";