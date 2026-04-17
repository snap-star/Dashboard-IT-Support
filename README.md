# Dashboard IT Support

Dashboard IT Support is a modern Next.js application designed to help IT teams manage support operations, incidents, asset inventories, ATM monitoring, overtime submissions, employee records, and reporting in one centralized interface.

## Key Features

- User authentication and registration flow
- Dashboard overview with incidents and support metrics
- IT incident management with CRUD operations
- Assets management organized by category (EDC, hardware, software)
- ATM operations and transaction recap dashboard
- CCTV and room check reporting
- Overtime application and submission tracking
- IP address tools and calculator utilities
- Macro generator and document / data uploader support
- Employee and user management pages
- Supabase integration for storage and database operations

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui
- Radix UI
- Recharts
- Zod

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
pnpm build
```

### Start production server

```bash
pnpm start
```

## Environment Variables

Create a `.env.local` file at the project root with the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

If you add other Supabase keys or custom secrets for deployment, include those in this file as well.

## Project Structure

- `src/app/` — Next.js app routes and page layout
- `src/components/` — shared UI and page components
- `src/lib/` — Supabase client and utility helpers
- `src/components/ui/` — design system components built on Radix and Tailwind

## Available Scripts

- `pnpm dev` — run the app in development mode
- `pnpm build` — compile the app for production
- `pnpm start` — start the production server
- `pnpm lint` — run linting checks

## Deployment

This project is compatible with Vercel, Netlify, or any Node.js hosting provider that supports Next.js.

For Vercel, simply connect the repository, configure environment variables, and deploy.

## Notes

- Supabase is used for database access and storage services.
- The app supports rich IT support workflows across incidents, asset tracking, ATM reporting, and employee management.
- Customize the workflow and Supabase schema as needed for your organization.
