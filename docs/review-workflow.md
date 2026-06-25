# Review Workflow

## Before merging changes

Run:

```bash
npm run build
npx prisma validate
npx prisma migrate status
git diff --check
```

If available:

```bash
npm run lint
npm run test
npm run typecheck
```

## Review checklist

- No secrets committed
- No `.env` files committed
- Prisma migrations are intentional
- Existing data is preserved
- Dashboard routes require authentication
- Owners can only access their own salon
- Payment logic is not changed accidentally
- No customer PII in analytics
- No raw payment payloads exposed
- i18n strings exist in DE/EN/FR
- Mobile layout works on common phone widths
