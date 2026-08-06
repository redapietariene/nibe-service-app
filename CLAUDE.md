# Nibe Service App

## What this is
A simple web app for Nibe service, which analyses nibe heat pump log and fetches information about alarms in uploaded log.

## Stack
- Next.js with the App Router
- TypeScript
- Tailwind CSS for all styling

## Architecture
- Data persists through a browser
- No backend
- No user accounts

## Running the app
Run `npm run dev`. The app runs at http://localhost:3001.

## Conventions
- New pages go inside the `app/` folder
- Shared UI components go in `app/components/`

## Do not
- Do not add npm packages without asking first
- Do not put secrets or API keys in source files — use .env.local for environment variables
