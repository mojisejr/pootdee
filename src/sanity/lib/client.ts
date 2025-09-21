import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Read-only client for fetching data
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for fresh data requirements
  perspective: 'published',
})

// Write client for server-side operations with authentication
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Write token for mutations
  perspective: 'published',
})

// Type-safe client interface
export type SanityClient = typeof client
export type SanityWriteClient = typeof writeClient
