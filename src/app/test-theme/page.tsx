"use client";

import { Button, Input, TextArea } from "@/components/ui";
import { useState } from "react";

export default function TestThemePage() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Theme System Test</h1>
        <p className="text-lg text-muted-foreground">
          Test the theme switching functionality and UI components below.
        </p>
      </div>

      {/* Color Palette Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-primary rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-secondary rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-accent rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Muted</p>
          </div>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎨</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Input Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Input Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Input
            placeholder="Default input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            placeholder="Error state"
            variant="error"
            error="This field has an error"
          />
          <Input
            placeholder="Success state"
            variant="success"
            success="This field is valid"
          />
          <Input
            placeholder="Warning state"
            variant="warning"
            warning="This field has a warning"
          />
        </div>
      </section>

      {/* TextArea */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">TextArea Component</h2>
        <div className="max-w-2xl">
          <TextArea
            placeholder="Enter your message here..."
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            maxLength={200}
            showCharCount
            helperText="This is a helper text for the textarea"
          />
        </div>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Semantic Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-success font-medium">Success Message</p>
            <p className="text-success/80 text-sm">Operation completed successfully</p>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-warning font-medium">Warning Message</p>
            <p className="text-warning/80 text-sm">Please review this action</p>
          </div>
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error font-medium">Error Message</p>
            <p className="text-error/80 text-sm">Something went wrong</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Typography System</h2>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
          <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
          <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
          <p className="text-lg text-foreground">Large paragraph text</p>
          <p className="text-base text-foreground">Regular paragraph text</p>
          <p className="text-sm text-muted-foreground">Small muted text</p>
          <p className="text-xs text-muted-foreground">Extra small text</p>
        </div>
      </section>
    </div>
  );
}