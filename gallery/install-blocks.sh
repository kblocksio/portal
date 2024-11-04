#!/bin/bash
#------------------------------------------------------------------------------#
# usage: ./install.sh [kblock]
# if no kblock is provided, all kblocks will be installed
#------------------------------------------------------------------------------#
set -euo pipefail

KBLOCKS_CLI=${KBLOCKS_CLI:-"npx kb"}

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
    $KBLOCKS_CLI install -n kblocks --release-name $name
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
