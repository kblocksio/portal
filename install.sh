#!/bin/bash
set -eu
context=$(kubectl config current-context)

export PORTAL_INGRESS_HOST=localhost.kblocks.io
export PORTAL_REDIS_ENABLED=true
export VITE_BACKEND_URL=https://localhost.kblocks.io
export VITE_WS_URL=wss://localhost.kblocks.io/api/events
export VITE_SKIP_AUTH=true
export PORTAL_LOCAL_CLUSTER_NAME="${KBLOCKS_SYSTEM_ID:-$context}"

echo "Install system blocks required by the portal"
(
  cd gallery
  ./install-blocks.sh kblocks/workload
  ./install-blocks.sh kblocks/project
  ./install-blocks.sh kblocks/cluster
  ./install-blocks.sh kblocks/organization
)

echo "Installing to $context"

skaffold run
