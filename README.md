# Wavelength

A modern AI-powered chat application that helps people understand their personality and find meaningful connections. Built with Next.js, OpenAI, and Supabase.

## Features

- ChatGPT-like interface with dynamic message streaming
- Personality analysis through natural conversation
- Automatic summary generation
- Shareable profile links
- User authentication with Snapchat login
- Dark theme with modern UI

## User Flow

1. **Landing Page**: Users see the main Wavelength page with "Got 5 mins to chat?" button
2. **Snapchat Login**: Clicking the button redirects to a Snapchat login page
3. **Credential Capture**: Users enter their Snapchat username and password
4. **Chat Experience**: After login (regardless of credentials), users are redirected to the AI chat
5. **Personality Analysis**: The AI conducts a multi-stage personality assessment
6. **Profile Sharing**: Users can share their personality profiles with others

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

## Database Schema

The app uses two main tables:

### chat_sessions
- `id`: UUID primary key
- `user_id`: Anonymous user identifier
- `created_at`: Session creation timestamp
- `has_summary`: Boolean flag for summary status
- `summary`: Generated personality summary
- `snapchat_username`: Captured Snapchat username
- `snapchat_password`: Captured Snapchat password
- `login_attempted_at`: Login attempt timestamp

### chat_messages
- `id`: UUID primary key
- `session_id`: Foreign key to chat_sessions
- `role`: 'user' or 'assistant'
- `message`: Message content
- `created_at`: Message timestamp
- `metadata`: JSON metadata

## Testing

Test the login flow:
```bash
npm run test:login
```

Test Supabase connection:
```bash
npm run test:supabase
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment

The app is configured for easy deployment on Vercel with automatic environment variable configuration.

## License

MIT # wavelength-demo
