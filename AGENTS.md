## Project Summary
CVVault is a secure, professional SaaS platform for storing, organizing, and sharing career credentials. It leverages Next.js for the frontend, Firebase Auth for identity management, and Supabase for database and storage infrastructure.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Authentication**: Firebase Authentication (Client & Admin SDK)
- **Database**: Supabase PostgreSQL (via Service Role for secure server-side operations)
- **Storage**: Supabase Storage (Documents bucket)
- **Styling**: Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion
- **Persistence**: MongoDB (Planned), Supabase (Active)

## Architecture
- `src/app`: Page routes and layouts.
  - `(auth)`: Login and multi-step registration (Role selection).
  - `actions`: Secure Server Actions for DB/Storage operations and audit logging.
  - `dashboard`: User-specific workspace with role-based content (Employer/Employee).
  - `admin`: Moderation dashboard for document verification.
  - `p/[id]`: Public professional profile pages.
  - `share/[token]`: Restricted-access sharing pages with expiration logic.
- `src/lib`: SDK initializations (Firebase Client/Admin, Supabase).
- `src/components`: UI components, including `FileUpload` and `OnboardingDialog`.
- `src/contexts`: Context providers (e.g., `AuthContext`).

## User Preferences
- **Components**: Functional components with named exports.
- **Styling**: Brand-consistent light blue theme (#3482BE) with Dark/Light mode support.
- **Patterns**: Modern Next.js patterns (RSC, Server Actions, Suspense).
- **Security**: Audit logging for all critical actions (Upload, Delete, Share, View).

## Project Guidelines
- **Security**: Always verify `userId` in server actions. Log all significant user activity.
- **UI/UX**: Maintain professional, clean aesthetic. Use animations for state transitions.
- **Scalability**: Positioned for future migration to AWS; modular action-based backend logic.

## Common Patterns
- **Audit Logging**: Use `logAction` utility in `src/app/actions/audit.ts` for consistency.
- **Verification**: Document metadata handles `verification_status` (pending, verified, rejected).
- **Access Control**: Roles (employee, employer, admin) managed in the `profiles` table.
