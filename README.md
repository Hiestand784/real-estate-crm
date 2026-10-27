# Real Estate CRM

A custom client and deal management tool for a real estate agent, replacing
scattered notes and files with one secure portal. Built as a real project for a
real client.

**Status:** In progress. Not yet deployed.

## The problem
Client data, key dates, and purchase agreements live in scattered notes and files.
Missed deadlines (earnest money, inspection, closing) are costly.

## Planned for v1
- [ ] Secure login with MFA
- [ ] Client and case (client + property) management
- [ ] Key dates: EMD, inspection, financing, appraisal, closing, and more
- [ ] Overview of all clients with upcoming dates highlighted
- [ ] Single-client timeline
- [ ] Private document storage per case
- [ ] CSV export and import
- [ ] Email reminders

## Backlog (after v1)
- AI summaries of purchase agreements (always reviewed by the agent)
- AI-written reminders and warnings
- Google Calendar sync
- Optional client logins

## Tech stack (planned)
React, TypeScript, PostgreSQL (Supabase)

## Security approach
Managed authentication with MFA, row-level security in the database, private file
storage, no secrets in the repository, and fake data only in development.