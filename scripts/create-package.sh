#!/usr/bin/env bash
# Scaffold a new test package: ./scripts/create-package.sh <name> <base-url>
set -euo pipefail
NAME=${1:?usage: create-package.sh <name> <base-url>}
URL=${2:?usage: create-package.sh <name> <base-url>}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
DIR="$ROOT/packages/$NAME"
[ -e "$DIR" ] && { echo "packages/$NAME already exists" >&2; exit 1; }

mkdir -p "$DIR"/{config-files,support/page-objects,tests}
sed "s/@playwright-e2e-template\/google/@playwright-e2e-template\/$NAME/" \
  "$ROOT/packages/google/package.json" > "$DIR/package.json"
sed "s|\"@google/\*\"|\"@$NAME/*\"|" "$ROOT/packages/google/tsconfig.json" > "$DIR/tsconfig.json"
cp "$ROOT/packages/google/playwright.config.ts" "$DIR/"
sed "s|https://www.google.com|$URL|" "$ROOT/packages/google/config-files/prod.ts" > "$DIR/config-files/prod.ts"
sed "s|https://www.google.com|$URL|" "$ROOT/packages/google/.env.example" > "$DIR/.env.example"

echo "Created packages/$NAME. Next:"
echo "  1. Add \"@$NAME/*\": [\"packages/$NAME/*\"] to tsconfig.json paths"
echo "  2. Add a @Product: value to PRODUCTS in eslint-rules/require-test-tags.js"
echo "  3. Add '$NAME' to the e2e matrix in .github/workflows/ci.yml"
echo "  4. npm install"
