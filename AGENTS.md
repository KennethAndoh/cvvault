## Project Summary
CVVault is a platform for managing and sharing CVs securely. It allows users to upload, store, and organize their professional documents with ease.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Authentication: Firebase Authentication
- Database/Backend: Firebase (Firestore, Admin SDK) & Supabase
- Styling: Tailwind CSS, Radix UI (shadcn/ui)
- State Management: React Hooks, Form management with React Hook Form & Zod
- Package Manager: Bun

## Architecture
- `src/app`: App router pages and layouts
- `src/lib`: Shared library utilities and SDK initializations (Firebase, Supabase)
- `src/components`: Reusable UI components

## User Preferences
- Use functional components with named exports.
- No comments unless requested.
- Use modern Next.js patterns (RSC, Server Actions where applicable).

## Project Guidelines
- Follow security best practices for API keys and secrets.
- Maintain small file sizes (approx. 600 lines).
- Wrap `useSearchParams` in Suspense boundaries.

## Common Patterns
- Initialization of Firebase (client/admin) and Supabase in `src/lib`.
