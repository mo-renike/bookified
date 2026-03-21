# Bookified

Bookified is a Next.js app that lets users upload books and have interactive AI voice conversations grounded in the book content.

## Features

- Authentication and user management with Clerk
- Upload and process PDF files into searchable text segments
- Personal library view with search by title or author
- Voice conversations powered by Vapi with book-aware tool calling
- Subscription-aware limits for books and session duration
- Light and dark themes

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- MongoDB + Mongoose
- Clerk
- Vapi Web SDK
- Vercel Blob upload flow

## Prerequisites

- Node.js 20+
- npm
- MongoDB database (Atlas or local)
- Clerk app keys
- Vapi API key and assistant id
- Vercel Blob read/write token

## Environment Variables

Create or update your .env file with:

```env
MONGODB_URI=
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_ASSISTANT_ID=
bookified_READ_WRITE_TOKEN=
VERCEL_BLOB_CALLBACK_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Notes:

- VERCEL_BLOB_CALLBACK_URL is optional in many local setups. The API route falls back to /api/uploads.
- Keep secrets private and never commit your real .env values.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## App Structure

- app/(root): main pages (library, book upload, subscriptions, book details)
- app/api: API routes for uploads and Vapi tool calls
- components: UI and feature components
- database: Mongoose connection and models
- hooks: client hooks (including Vapi session handling)
- lib/actions: server actions for books and voice sessions

## Voice Tool Route

The endpoint at /api/vapi/search-book handles Vapi tool calls for book-grounded retrieval.
It validates authentication and ownership, runs a text search over indexed segments, and returns formatted context to the voice assistant.

## Deployment

This app is ready for Vercel deployment.

Before deploying:

- Set all environment variables in your hosting provider.
- Ensure your MongoDB network and credentials allow production access.
- Configure Clerk production keys and allowed domains.
- Configure Vercel Blob token and callback behavior.

## License

No license has been specified yet.
