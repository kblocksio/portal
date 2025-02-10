#!/bin/sh
set -eu

key=${1:-}
cert=${2:-}

if [ -z "$key" ] || [ -z "$cert" ]; then
  echo "Usage: $0 <key> <pem>"
  echo "You can download the .key and .pem files from https://dnsimple.com/a/137210/domains/kblocks.io/certificates/1864734/installation (under NGINX)"
  exit 1
fi

kubectl delete secret kblocks-tls -n default 2>/dev/null || true
kubectl create secret tls kblocks-tls --key=$key --cert=$cert -n default
