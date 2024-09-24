#!/bin/sh
set -euo pipefail
dir=$(cd $(dirname "$0") && pwd)

# put the .env.prod in a temp file and append the secrets
env_file=$(mktemp)
cat "$dir/../apps/server/.env.prod" > "$env_file"
echo "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" >> "$env_file"
echo "GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET" >> "$env_file"

kubectl create secret generic kblocks-api-secrets --from-env-file="$env_file"

rm "$env_file"
