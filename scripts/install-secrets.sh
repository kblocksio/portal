#!/bin/sh
set -euo pipefail
dir=$(cd $(dirname "$0") && pwd)

secret="kblocks-api-secrets"

kubectl delete secret "$secret" || true

kubectl create secret generic "$secret" \
  --from-literal=SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
  --from-literal=GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
  --from-literal=REDIS_PASSWORD="$REDIS_PASSWORD" \
  --from-literal=SLACK_API_TOKEN="$SLACK_API_TOKEN"
