# Security Policy

## Scope

This policy applies to the Dashboard IT Support project maintained in this repository. It covers
application security, dependency security, secrets handling, and responsible vulnerability
reporting.

## Supported Versions

This repository does not maintain multiple supported release lines. Security support is provided for
the current development branch and production branch in active use.

- `master` — active deployment branch
- `Development` — active development branch

## Security Practices

- Keep all dependencies up to date with regular reviews and updates.
- Run `pnpm audit` and workflow security checks in CI to catch dependency vulnerabilities.
- Do not commit secrets or environment variables.
- Store Supabase credentials and any API keys in environment variables, not in source control.
- Use `.env.local` or your deployment provider’s secret store for sensitive values.

## Environment Secrets

The following values should be stored securely and never committed to the repository:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Any additional Supabase service keys or runtime secrets

## Reporting a Vulnerability

If you discover a security issue in this project, report it immediately to the repository owner or
project maintainer.

Preferred reporting methods:

- Open a private support ticket or internal issue tracker
- Email the project maintainer if available

Please include:

- A clear description of the issue
- Steps to reproduce it
- The affected component or page
- Any relevant screenshots, logs, or payload examples

## Response Expectations

- Acknowledgement of the report should occur within 48 hours.
- Critical issues affecting confidentiality, integrity, or availability should be addressed as a
  priority.
- Fixes should be validated in development before deployment.

## Additional Notes

This project uses Supabase for authentication, database access, and storage. Protect Supabase keys
as sensitive credentials, and do not expose them in public repos or browser debug output.
