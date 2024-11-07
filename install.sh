#!/bin/bash
set -eu

env=${1:-}

if [ -z "$env" ]; then
  echo "Error: env variable is required"
  exit 1
fi

if [ "$env" == "kind" ]; then
  kubectl config use-context kind-kind
  export PORTAL_INGRESS_HOST=localhost.kblocks.io
  export PORTAL_REDIS_ENABLED=true
  export VITE_BACKEND_ENDPOINT=localhost.kblocks.io
  export VITE_SKIP_AUTH=true
  skaffold run
elif [ "$env" == "dev" ]; then
  qkube use staging.quickube.sh
  export PORTAL_INGRESS_HOST=staging.kblocks.io
  export PORTAL_REDIS_ENABLED=false
  skaffold run
else
  echo "Error: Invalid env value"
  exit 1
fi
