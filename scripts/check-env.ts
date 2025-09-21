#!/usr/bin/env tsx

/**
 * Environment Variable Checker
 * Validates that all required environment variables are present
 * Part of Phase -1 health-check scripts
 */

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvCheck[] = [
  {
    name: 'NEXT_PUBLIC_SANITY_PROJECT_ID',
    required: true,
    description: 'Sanity project ID for CMS connection'
  },
  {
    name: 'NEXT_PUBLIC_SANITY_DATASET',
    required: true,
    description: 'Sanity dataset name'
  },
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    description: 'Clerk publishable key for authentication'
  },
  {
    name: 'CLERK_SECRET_KEY',
    required: true,
    description: 'Clerk secret key for server-side authentication'
  },
  {
    name: 'GOOGLE_AI_API_KEY',
    required: false,
    description: 'Google AI API key for AI features'
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features'
  }
];

function checkEnvironmentVariables(): void {
  console.log('🔍 Checking environment variables...\n');
  
  let hasErrors = false;
  let hasWarnings = false;

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];
    const isPresent = value !== undefined && value !== '';

    if (envVar.required) {
      if (isPresent) {
        console.log(`✅ ${envVar.name}: Present`);
      } else {
        console.log(`❌ ${envVar.name}: MISSING (Required)`);
        console.log(`   Description: ${envVar.description}`);
        hasErrors = true;
      }
    } else {
      if (isPresent) {
        console.log(`✅ ${envVar.name}: Present (Optional)`);
      } else {
        console.log(`⚠️  ${envVar.name}: Missing (Optional)`);
        console.log(`   Description: ${envVar.description}`);
        hasWarnings = true;
      }
    }
  }

  console.log('\n📊 Environment Check Summary:');
  
  if (hasErrors) {
    console.log('❌ FAILED: Missing required environment variables');
    console.log('💡 Create a .env.local file with the missing variables');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  PASSED with warnings: Some optional variables are missing');
    console.log('💡 Consider adding optional variables for full functionality');
    process.exit(0);
  } else {
    console.log('✅ PASSED: All environment variables are present');
    process.exit(0);
  }
}

// Load environment variables from .env files
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first (highest priority)
config({ path: resolve(process.cwd(), '.env.local') });
// Load .env as fallback
config({ path: resolve(process.cwd(), '.env') });

checkEnvironmentVariables();