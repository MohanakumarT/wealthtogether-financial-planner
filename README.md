# WealthTogether Investments

A responsive professional fintech homepage, reusable design system, and financial calculator framework for WealthTogether Investments. Calculators include SIP, step-up SIP, SWP, lumpsum, goal planning, retirement, child education, marriage goal, emergency fund, inflation, house purchase, and car purchase planning.

## Stack

- Next.js 15 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and shadcn/ui conventions
- Recharts 3, React Hook Form, and Zod
- jsPDF and AutoTable for on-demand report downloads
- next-themes for system-aware and user-selectable light and dark themes
- ESLint flat config and Prettier

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For production deployment, follow [Vercel deployment instructions](DEPLOYMENT.md).

## Supabase authentication

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your Supabase project’s API settings.
The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted. Restart the Next.js
server after changing environment variables. Set these public values before
building and redeploy after changing them because Next.js includes
`NEXT_PUBLIC_` variables in the browser bundle. Never put a Supabase service-role
key in a `NEXT_PUBLIC_` variable or in client code.

In Supabase **Authentication → URL Configuration**, set your site URL (for local
development, `http://localhost:3000`) and allow these redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-production-domain.example/auth/callback
```

The app includes `/auth/sign-up`, `/auth/login`, `/auth/forgot-password`,
`/auth/update-password`, and `/profile`. Email confirmation and password reset
links use the callback route to exchange the Supabase PKCE code and return the
user to the appropriate page. Profile names are stored as Supabase Auth user
metadata (`full_name`).

Saved calculation history requires applying
[`supabase/migrations/20261026000000_saved_calculations.sql`](supabase/migrations/20261026000000_saved_calculations.sql)
to the Supabase project (using the Supabase CLI or SQL Editor). The migration
creates a private per-user table with row-level security. Authenticated users
can save, reopen and edit, duplicate, and delete their calculations at
`/history`; each record stores its calculator inputs and a compact result summary.

## Consultation bookings

The profile and request form are available at `/consultation`. Set
`NEXT_PUBLIC_CONSULTATION_EMAIL` and
`NEXT_PUBLIC_CONSULTATION_WHATSAPP` to show real contact links. Apply
[`supabase/migrations/20261026001000_consultation_requests.sql`](supabase/migrations/20261026001000_consultation_requests.sql)
and set the server-only `SUPABASE_SERVICE_ROLE_KEY` to accept booking requests.
Requests are stored as pending and are not publicly readable. Optional Resend
notifications use `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
`CONSULTATION_NOTIFICATION_EMAIL`; without them, requests remain available in
the Supabase dashboard for follow-up.

## Contact page

The contact page is at `/contact`. Configure `NEXT_PUBLIC_CONTACT_EMAIL`,
`NEXT_PUBLIC_CONTACT_WHATSAPP`, `NEXT_PUBLIC_INSTAGRAM_URL`, and
`NEXT_PUBLIC_LINKEDIN_URL` before building to activate the public links; rebuild
after changing them. Apply
[`supabase/migrations/20261026002000_contact_messages.sql`](supabase/migrations/20261026002000_contact_messages.sql)
and keep `SUPABASE_SERVICE_ROLE_KEY` server-only to accept private contact
messages. Optional Resend notifications use the existing sender settings and
`CONTACT_NOTIFICATION_EMAIL`; otherwise messages are available in the Supabase
dashboard.

Public form APIs require the persistent rate-limit function from
`supabase/migrations/20261026003000_public_rate_limits.sql` in addition to the
contact and consultation table migrations.

## AI financial assistant

Each calculator page includes the WealthTogether AI assistant. It explains the
active calculator’s current inputs and projections, keeps a short in-page chat
history, and offers a consultation link. Its responses are educational, not
personalized financial advice. To enable it, set the server-only
`OPENAI_API_KEY` (optionally `OPENAI_MODEL`) and apply the rate-limit migration
above. The assistant sends the current calculator snapshot and chat context to
the OpenAI Responses API with response storage disabled; the application does
not save the chat. Users are asked not to include personal or account details.

## Portfolio tracker

The `/portfolio` tracker lets users manually add, edit, filter, and delete
mutual fund, stock, fixed deposit, PPF, EPF, NPS, gold, and cash holdings. It
shows browser-based totals, allocation and investment timeline charts, and a
branded PDF summary. Holdings are stored in versioned local storage on the
current browser only; this page does not connect to account providers or fetch
market prices. The storage adapter is isolated in `src/features/portfolio` so
it can later be replaced by an authenticated Supabase repository.

Portfolio holdings include a family-member assignment. Existing v1 portfolio
data is copied into the v2 format and assigned to Self when first opened.

## Family financial dashboard

The `/family` dashboard includes profiles for Self, Spouse, Child 1, Child 2,
and Parents. It summarizes household net worth, goal progress, retirement goal
progress, emergency reserves, upcoming goal dates and policy renewals, and
investment allocation. Profile goals, emergency fund values, other assets,
liabilities, and insurance policies are stored in versioned local storage.
Investment holdings are shared with `/portfolio` and can be assigned to each
profile there. The dashboard is browser-local, not encrypted or synced, and is
marked noindex.

## Client CRM

The private `/admin` workspace requires an authenticated Supabase account with
an explicit row in `public.admin_users`. It supports client profiles, searchable
and paginated client records, follow-up statuses, consultation history, linked
saved calculations, PDF client reports, CSV export, and enquiry/consultation
status tracking. CRM records are served through server routes guarded by the
admin role check; browser clients never receive the service-role key.

Apply `supabase/migrations/20261026004000_client_crm.sql` after the existing
migrations. Create the first trusted admin account in Supabase Authentication,
then run the example `admin_users` insert at the bottom of that migration using
the account's email. The migration supports `owner`, `admin`, `advisor`, and
`viewer` roles. The CRM has no administrator sign-up flow; assignments must be
made from a trusted Supabase SQL session. A client's existing saved plans are
linked automatically when their CRM email matches their WealthTogether account.

## Project structure

```text
src/
  app/                 Routes, theme tokens, global styles
  components/
    marketing/         Homepage sections
    ui/                Reusable interface primitives
    navigation.tsx     Responsive site navigation
    footer.tsx         Shared footer and disclosures
    providers.tsx      Theme provider
  features/
    calculators/       Calculator contract, hooks, shared UI, and calculator modules
    financial-assistant/ Calculator context, chat UI, and assistant hook
    portfolio/         Local holdings repository, tracker UI, charts, and PDF export
    family/            Household profiles, local finance repository, dashboard, and charts
    admin/             Private CRM forms, dashboards, tables, and client profiles
    contact/           Contact message schema and form
    consultations/     Consultation request schema and form
  hooks/               Shared React hooks
  lib/                 Shared utilities
  types/               Shared TypeScript types
```

## Calculator framework

Each calculator provides a typed Zod schema, default values, responsive field metadata, and a calculation function returning metrics, chart data, and year-wise rows. `CalculatorShell` supplies validation, reset, result cards, chart, year-wise table, sharing, PDF download, and the active app theme. See [calculator framework documentation](src/features/calculators/README.md).

The SIP Calculator is at `/calculators/sip`; the Lumpsum Calculator is at `/calculators/lumpsum`; the Step-up SIP Calculator is at `/calculators/step-up-sip`; and the SWP Calculator is at `/calculators/swp`. The Goal Planner compares multiple goals at `/calculators/goal-planner`, while the Mutual Fund Goal Planner compares two SIP amounts for one goal at `/calculators/mutual-fund-goal-planner`. Retirement, child education, marriage goal, emergency fund, inflation, house purchase, and car purchase planning are available at `/calculators/retirement`, `/calculators/child-education`, `/calculators/marriage-goal`, `/calculators/emergency-fund`, `/calculators/inflation`, `/calculators/house-purchase`, and `/calculators/car-purchase`. Each planner states its calculation assumptions alongside its projections.

The share action includes result metrics and a clean page URL but omits input assumptions and URL query data. PDF downloads contain the assumptions, results, and year-wise table, and only start when a user selects Download PDF.

Brand tokens live in `src/app/globals.css`: navy `#081B3A`, gold `#D4AF37`, white, semantic surface and text roles, dark theme values, typography, and responsive spacing. Components are exported from `@/components` and `@/components/ui`; calculator APIs are exported from `@/features/calculators`.

Homepage planning perspectives are representative examples, not customer testimonials or endorsements.

## SEO and performance

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin for production before
building. Production builds fail when this is missing or still points to the
local/placeholder URL. The metadata base, canonical URLs, Open Graph and
Twitter cards, JSON-LD identifiers, `robots.txt`, and `sitemap.xml` all use this value.
The sitemap includes public marketing and calculator routes; authentication,
profile, saved-plan, and API routes are excluded from indexing. Do not deploy
with the placeholder domain from `.env.example`.
Vercel Preview builds are noindex and do not publish a sitemap.

Page titles and descriptions are defined with the shared metadata helper at
`src/lib/seo.ts`. The root layout provides Organization, WebSite, and
WebApplication JSON-LD. The Open Graph preview is generated by Next.js at
`/opengraph-image`. Calculator charts load only when results are shown to keep
the initial page bundle leaner.

## Commands

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

Use `.env.example` as the starting point for local environment configuration. Keep secrets out of source control and browser-visible variables.
