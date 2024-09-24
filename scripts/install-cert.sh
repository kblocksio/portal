#!/bin/sh
set -euo pipefail

key=${1:-}
cert=${2:-}

if [ -z "$key" ] || [ -z "$cert" ]; then
    echo "Usage: $0 <key> <cert>"
    exit 1
fi

kubectl create secret tls kblocks-tls --key=$key --cert=$cert -n default