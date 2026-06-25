#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-.}"

echo "Running basic secret keyword scan in: $TARGET_DIR"
echo "This is not a full security audit. It only catches obvious mistakes."

set +e
grep -RInE "sk_live|pk_live|whsec_|rk_live|service_role|DATABASE_URL|DIRECT_URL|RESEND_API_KEY|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET|PAYPAL_CLIENT_SECRET|PAYPAL_WEBHOOK_ID|password|secret|token|private key" "$TARGET_DIR"   --exclude-dir=.git   --exclude=.env.example
SCAN_EXIT=$?
set -e

if [ "$SCAN_EXIT" -eq 0 ]; then
  echo ""
  echo "WARNING: Potential sensitive keywords found. Review output above before publishing."
  exit 1
fi

echo "No obvious sensitive keywords found by basic scan."
