#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${1:-$(pwd)}"
SHOWCASE_DIR="${2:-../timoa-automation-showcase}"

mkdir -p "$SHOWCASE_DIR/code-samples"

copy_if_exists() {
  local src="$1"
  local dest="$2"

  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "Copied sample: $src"
  else
    echo "Skipped missing sample: $src"
  fi
}

copy_if_exists "$SOURCE_DIR/prisma/schema.prisma" "$SHOWCASE_DIR/code-samples/prisma-schema-excerpt.txt"
copy_if_exists "$SOURCE_DIR/prisma/pilot-setup.ts" "$SHOWCASE_DIR/code-samples/pilot-setup.ts.txt"
copy_if_exists "$SOURCE_DIR/components/payments/payment-method-selector.tsx" "$SHOWCASE_DIR/code-samples/payment-method-selector.tsx.txt"
copy_if_exists "$SOURCE_DIR/components/payments/payment-brand-marks.tsx" "$SHOWCASE_DIR/code-samples/payment-brand-marks.tsx.txt"
copy_if_exists "$SOURCE_DIR/lib/insights/salon-insights.ts" "$SHOWCASE_DIR/code-samples/salon-insights.ts.txt"
copy_if_exists "$SOURCE_DIR/lib/i18n/dictionaries.ts" "$SHOWCASE_DIR/code-samples/i18n-dictionaries-excerpt.ts.txt"

echo ""
echo "Copied selected samples. Review every copied file manually before publishing."
