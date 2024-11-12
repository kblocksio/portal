#!/bin/bash
#------------------------------------------------------------------------------#
# usage: ./install.sh [kblock]
# if no kblock is provided, all kblocks will be installed
#------------------------------------------------------------------------------#
set -eu
dir=$(cd $(dirname $0) && pwd)
cd $dir

KBLOCKS_CLI=${KBLOCKS_CLI:-"npx kb"}
KBLOCKS_HOST="${KBLOCKS_HOST:-}"

context=$(kubectl config current-context)

if [ "$context" == "kind-kind" ]; then
  KBLOCKS_HOST=http://portal-backend.default.svc.cluster.local:3001
fi

if [ -z "$KBLOCKS_HOST" ]; then
  echo "KBLOCKS_HOST is not set (e.g. https://staging.kblocks.io)"
  exit 1
fi

# Error if KBLOCKS_HOST doesn't start with http
if [[ "$KBLOCKS_HOST" != http://* && "$KBLOCKS_HOST" != https://* ]]; then
  echo "KBLOCKS_HOST must start with http:// or https:// (e.g. https://staging.kblocks.io)"
  exit 1
fi

echo "KBLOCKS_HOST: $KBLOCKS_HOST"
echo "KBLOCKS_CLI: $KBLOCKS_CLI"

#------------------------------------------------------------------------------#
# install_kblock
#------------------------------------------------------------------------------#
install_kblock() {
  dir=$1
  (
    cd $dir
    name=$(basename $dir)
    echo "Installing block: $PWD..."
    $KBLOCKS_CLI install \
      -e KBLOCKS_API="${KBLOCKS_HOST}/api" \
      -e KBLOCKS_EVENTS_URL="${KBLOCKS_HOST}/api/events" \
      -e KBLOCKS_CONTROL_URL="${KBLOCKS_HOST}/api/control" \
      -n kblocks \
      --release-name $name
  )
}

# if there are any arguments, use them to determine which kblocks to install otherwise, install all
# kblocks
blocks=$@

if [ -z "$blocks" ]; then
  blocks=$(find kblocks -maxdepth 1 -type d -not -path kblocks)
  echo "No arguments provided, installing all kblocks..."
fi

for name in $blocks; do
  install_kblock $name
done
