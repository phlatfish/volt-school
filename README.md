# Volt School

A school transportation management system built with SvelteKit and Supabase.

## Deployment to Vercel

This application is configured for deployment on Vercel with Supabase for data storage.

### Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Create a Supabase account at [supabase.com](https://supabase.com) and set up a new project
3. Install the Vercel CLI: `npm install -g vercel`

### Required Tables in Supabase

Create the following tables in your Supabase project:

1. `students` table with columns:
   - `id` (text, primary key)
   - `data` (jsonb)

2. `buses` table with columns:
   - `id` (text, primary key)
   - `data` (jsonb)

3. `incidents` table with columns:
   - `id` (text, primary key)
   - `data` (jsonb)

### Environment Variables

You need to set up the following environment variables in your Vercel project:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)

### Deployment Steps

1. Login to Vercel CLI: `vercel login`
2. Link to your Supabase project by adding the environment variables
3. Deploy to Vercel: `vercel`
4. For production deployment: `vercel --prod`

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
4. Run the development server: `npm run dev`

## Data Storage

This application uses Supabase for persisting data. The stores (students, buses, incidents) are automatically synchronized with your Supabase database when running in a browser environment.
