#!/bin/sh
set -euo pipefail

key=${1:-}
cert=${2:-}

if [ -z "$key" ] || [ -z "$cert" ]; then
  echo "Usage: $0 <key> <pem>"
  echo "You can download the 'kblocks_io.key' and 'kblocks_io.pem' files from 1Password:"
  echo "  https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com"
  exit 1
fi

kubectl delete secret kblocks-tls -n default || true
kubectl create secret tls kblocks-tls --key=$key --cert=$cert -n default
