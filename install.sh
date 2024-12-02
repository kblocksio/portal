#!/bin/bash
set -eu
context=$(kubectl config current-context)

if [ "$context" == "kind-kind" ]; then
  export PORTAL_INGRESS_HOST=localhost.kblocks.io
  export PORTAL_REDIS_ENABLED=true
  export VITE_BACKEND_URL=https://localhost.kblocks.io
  export VITE_WS_URL=wss://localhost.kblocks.io/api/events
  export VITE_SKIP_AUTH=true
else
  qkube use staging.quickube.sh
  export PORTAL_INGRESS_HOST=staging.kblocks.io
  export PORTAL_REDIS_ENABLED=false
fi

echo "Install system blocks required by the portal"
(
  cd gallery
  ./install-blocks.sh kblocks/workload
  ./install-blocks.sh kblocks/project
  #TODO (ainvoner): ./install-blocks.sh kblocks/cluster
)

echo "Installing to $context"

skaffold run
