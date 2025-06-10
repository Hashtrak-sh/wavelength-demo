# Wavelength

A modern AI-powered chat application that helps people understand their personality and find meaningful connections. Built with Next.js, OpenAI, and Supabase.

## Features

- ChatGPT-like interface with dynamic message streaming
- Personality analysis through natural conversation
- Automatic summary generation
- Shareable profile links
- User authentication
- Dark theme with modern UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI API
- **Auth & Database**: Supabase
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment

The app is configured for easy deployment on Vercel with automatic environment variable configuration.

## License

MIT 