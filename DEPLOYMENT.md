# Vercel deployment

This app uses the Next.js App Router and deploys to Vercel with the default
Next.js build output. No custom `vercel.json` or output directory is required.

## Before you deploy

1. Push this project to a Git provider supported by Vercel. This workspace must
   be committed to a Git repository before it can be imported from Git.
2. Create a Supabase project if you want account profiles, saved calculations,
   contact submissions, or consultation requests.
3. Decide on the canonical HTTPS domain for the production site.

## Import the project

1. In Vercel, choose **Add New → Project** and import the Git repository.
2. Keep the project root at the folder containing `package.json`.
3. Use the **Next.js** framework preset, `npm ci` for install, and
   `npm run build` for the build. Leave the output directory at its default.
4. Select **Node.js 24.x** in the Vercel project settings. The repository pins
   this version with `package.json` and `.nvmrc`.

## Configure Supabase

In the Supabase SQL Editor, run the migrations in filename order:

1. `supabase/migrations/20261026000000_saved_calculations.sql`
2. `supabase/migrations/20261026001000_consultation_requests.sql`
3. `supabase/migrations/20261026002000_contact_messages.sql`
4. `supabase/migrations/20261026003000_public_rate_limits.sql`
5. `supabase/migrations/20261026004000_client_crm.sql`
6. `supabase/migrations/20261026005000_auth_profiles.sql`
7. `supabase/migrations/20261026006000_crm_management.sql`
8. `supabase/migrations/20261026007000_financial_assistant.sql`

The auth profile migration creates the self-service `profiles` table and
creates or synchronizes a profile for each Supabase Auth user. New accounts
receive the `client` role. Admin access is granted only through
`public.admin_users`; its protected trigger mirrors that role into the profile
record. Add the production and preview callback URLs ending in
`/auth/callback` to the Supabase Auth redirect allow list.
Enable the Supabase email/password provider and email confirmations so new
client accounts complete verification before signing in. Set the Supabase Site
URL to the production origin; add local and preview callback URLs when those
environments need to verify accounts or complete password recovery.

The rate-limit migration is required for public form submissions. The RPC is
available only to `service_role`; its table has row-level security enabled and
stores keyed hashes instead of raw IP addresses or email addresses.

In **Supabase → Authentication → URL Configuration**:

- Set the Site URL to the production HTTPS origin.
- Add the production callback URL, `https://your-domain.example/auth/callback`,
  to the allowed redirect URLs. Replace the example host with the real domain.
- Add each Vercel Preview origin’s callback URL to the allow list if you test
  signup or password recovery in Preview deployments. Keep the allow list as
  narrow as the team’s preview workflow allows.

## Set environment variables

Add variables in **Vercel → Project → Settings → Environment Variables** and
select the environments where each value should be available. Set them before
the first deployment. Changes to `NEXT_PUBLIC_` values require a new build and
deployment.

| Variable                               | Required for                                                 | Notes                                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Every deployment                                             | Production canonical HTTPS origin. Set the same production origin in Preview so preview metadata points to the canonical site; Preview routes are noindex. |
| `NEXT_PUBLIC_SUPABASE_URL`             | Auth, saved plans, and public forms                          | Supabase project URL.                                                                                                                                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Auth, saved plans, and public forms                          | Browser-safe Supabase publishable key. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported if needed.                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`            | Contact, consultation, persistent rate limits, and admin CRM | Server-only secret. It powers protected CRM APIs after the signed-in user passes the admin role check. Never prefix it with `NEXT_PUBLIC_`.                |
| `GEMINI_API_KEY`                       | AI financial assistant                                       | Server-only Google Gemini API key used by `/api/financial-assistant`. Never prefix it with `NEXT_PUBLIC_`.                                                 |
| `GEMINI_MODEL`                         | AI financial assistant                                       | Optional Gemini model override. Defaults to `gemini-3.8-flash`.                                                                                            |
| `NEXT_PUBLIC_CONTACT_EMAIL`            | Contact links                                                | Public contact address.                                                                                                                                    |
| `NEXT_PUBLIC_CONTACT_WHATSAPP`         | Contact and consultation links                               | Public phone number in international format.                                                                                                               |
| `NEXT_PUBLIC_CONSULTATION_EMAIL`       | Consultation profile                                         | Public advisory email; the contact email is used as a fallback.                                                                                            |
| `NEXT_PUBLIC_CONSULTATION_WHATSAPP`    | Consultation profile                                         | Optional fallback if the contact WhatsApp value is unset.                                                                                                  |
| `NEXT_PUBLIC_INSTAGRAM_URL`            | Contact links and organization data                          | HTTPS Instagram URL.                                                                                                                                       |
| `NEXT_PUBLIC_LINKEDIN_URL`             | Contact links and organization data                          | HTTPS LinkedIn URL.                                                                                                                                        |
| `RESEND_API_KEY`                       | Email notifications                                          | Optional. Requests are still saved if email notifications are not configured.                                                                              |
| `RESEND_FROM_EMAIL`                    | Email notifications                                          | Sender address verified with Resend.                                                                                                                       |
| `CONSULTATION_NOTIFICATION_EMAIL`      | Booking notifications                                        | Recipient for consultation requests.                                                                                                                       |
| `CONTACT_NOTIFICATION_EMAIL`           | Contact notifications                                        | Recipient for contact messages; falls back to the consultation notification address.                                                                       |

Set public variables in **Production, Preview, and Development** as needed.
The production build fails if `NEXT_PUBLIC_SITE_URL` is missing, not HTTPS, or
still points at localhost or the `.example` placeholder. Keep the actual
service-role key and Resend API key in Vercel’s encrypted server environment.
The AI assistant also needs `GEMINI_API_KEY`, the Supabase rate-limit RPC, and
migration `20261026007000_financial_assistant.sql`. It limits requests to 8
per minute and 40 per day per client IP and user. Authenticated client accounts
can use `/assistant`; each request sends the question and, only after explicit
opt-in, a minimized planning snapshot to the Google Gemini API with response
storage disabled. Conversation text is stored in private, per-user Supabase
tables; the planning snapshot is not stored with chat history. The chat labels
personal context sharing and offers a consultation link. Remind users not to
enter personal identifiers in their questions; account identifiers are excluded
from the optional planning snapshot.

## Provision admin access

The CRM is available at `/admin`; it has no administrator self-registration
page. Create the first account from Supabase Authentication using a trusted team email, then
run this statement in the Supabase SQL editor, replacing the address:

```sql
insert into public.admin_users (user_id, role)
select id, 'owner'
from auth.users
where lower(email) = lower('admin@example.com');
```

Only the user's own role row is readable through the authenticated client. CRM
client, consultation, and client-linked saved-plan data remain unavailable to
browser database requests; admin APIs verify the session and role before using
the server-only service key. The migration automatically links CRM client email
addresses with matching signed-in accounts so their existing saved financial
plans can be shown in the profile. The management migration adds financial
goals, investments, insurance, interaction history, tasks, and a private file
bucket with signed downloads. Only non-sensitive Realtime invalidation events
are broadcast to authenticated CRM administrators. Keep the service-role key
server-only. Once the first owner is provisioned, additional registered users
can be assigned admin, advisor, or viewer access at `/admin/settings`.

## Deploy and attach a domain

Vercel creates a Preview deployment for a branch and a Production deployment
from the configured production branch. Review the Preview URL, then merge or
push the approved commit to the production branch. Add the production domain in
**Project → Settings → Domains**, complete the DNS instructions, and wait for
Vercel to issue HTTPS before sharing the site.

The app sets `noindex` and disallows crawling on Vercel Preview deployments.
Production metadata, canonical links, sitemap, and social cards use
`NEXT_PUBLIC_SITE_URL`.

## Post-deploy checks

- Open the homepage, a calculator, contact, and consultation pages on the
  production domain.
- Confirm `/robots.txt` references the production `/sitemap.xml` and the
  sitemap contains only public marketing and calculator pages.
- Check page source for the canonical link, Open Graph image, and JSON-LD.
- Test signup, email confirmation, sign-in, password reset, profile update, and
  sign-out with a test account.
- Save, edit, duplicate, and delete a test calculation. Confirm one user cannot
  read another user’s saved rows.
- Submit test contact and consultation requests. Confirm they appear in the
  private Supabase tables and optional Resend notifications arrive.
- Add a CRM client, record goals and investments, upload/download a private
  document, complete a follow-up task, and verify the dashboard refreshes in an
  open admin session. Export a multi-sheet Excel workbook and a client PDF.
- Ask the calculator assistant to explain a result and compare the precomputed
  10% monthly-contribution scenario. Confirm the consultation link works.
- Download a PDF report and export a chart PNG on desktop and mobile.
- Run `npm run check` before merging changes.

## Troubleshooting

- **Build says `NEXT_PUBLIC_SITE_URL` is invalid:** set the real HTTPS origin
  for the Vercel environment and redeploy.
- **Contact or consultation returns 503:** verify the server-only service key
  and apply all four migrations, especially the persistent rate-limit RPC.
- **Signup or password reset returns to the login error:** add the exact
  production or Preview callback URL to Supabase’s allowed redirect URLs.
- **Email notifications do not arrive:** verify the Resend sender domain and
  the API key, sender, and recipient variables. Form data is saved independently
  of optional notification delivery.
- **AI assistant returns 503:** confirm `GEMINI_API_KEY`, the Supabase service
  role key, and the rate-limit migration are configured for that environment.
- **Preview pages are not indexed:** that is intentional. Vercel Preview
  deployments are noindex and their robots route blocks crawlers.
