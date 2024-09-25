#!/bin/sh
set -euo pipefail
dir=$(cd $(dirname "$0") && pwd)

kubectl create secret generic kblocks-api-secrets \
  --from-literal=SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
  --from-literal=GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET"

