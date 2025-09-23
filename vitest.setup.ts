import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local for testing
config({ path: path.resolve(process.cwd(), '.env.local') });