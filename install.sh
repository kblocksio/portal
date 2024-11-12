#!/bin/bash
set -eu
context=$(kubectl config current-context)

if [ "$context" == "kind-kind" ]; then
  export PORTAL_INGRESS_HOST=localhost.kblocks.io
  export PORTAL_REDIS_ENABLED=true
  export VITE_BACKEND_ENDPOINT=localhost.kblocks.io
  export VITE_SKIP_AUTH=true
else
  qkube use staging.quickube.sh
  export PORTAL_INGRESS_HOST=staging.kblocks.io
  export PORTAL_REDIS_ENABLED=false
fi

echo "Installing to $context"

skaffold run
