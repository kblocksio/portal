#!/bin/bash
set -eu pipefail

# cd to the root of the repo
cd $(dirname $0)/..

if [ -z "${KBLOCKS_SYSTEM_ID:-}" ]; then
  echo "KBLOCKS_SYSTEM_ID must be set with the system id (e.g. 'local', 'staging.kblocks.io', etc.)"
  exit 1
fi

./scripts/install-kblocks-secrets.sh ./secrets/kblocks-gallery.env ./secrets/kblocks-cluster.env
./scripts/install-portal-secrets.sh ./secrets/portal.env
./scripts/install-cert.sh ./secrets/STAR_kblocks_io.key ./secrets/STAR_kblocks_io.pem
