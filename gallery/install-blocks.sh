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
KBLOCKS_API_KEY="${KBLOCKS_API_KEY:-}"
KBLOCKS_STORAGE_PREFIX="${KBLOCKS_STORAGE_PREFIX:-}"

context=$(kubectl config current-context)

if [ "$context" == "kind-kind" ]; then
  KBLOCKS_HOST=portal-redis.default.svc.cluster.local
  KBLOCKS_API_KEY="pass1234"
fi

echo "KBLOCKS_HOST: $KBLOCKS_HOST"
echo "KBLOCKS_STORAGE_PREFIX: $KBLOCKS_STORAGE_PREFIX"
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
      -e KBLOCKS_HOST="${KBLOCKS_HOST}" \
      -e KBLOCKS_API_KEY="${KBLOCKS_API_KEY}" \
      -e KBLOCKS_STORAGE_PREFIX="${KBLOCKS_STORAGE_PREFIX}" \
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
