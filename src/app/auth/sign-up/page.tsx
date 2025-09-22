'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Join Pootdee to start analyzing and improving your English
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                card: "bg-card border border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: 
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                formFieldLabel: "text-foreground",
                formFieldInput: 
                  "border border-input bg-background text-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            redirectUrl="/analyzer"
            signInUrl="/auth/sign-in"
          />
        </div>
      </div>
    </div>
  );
}