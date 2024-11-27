#!/bin/sh
set -eu
dir=$(cd $(dirname "$0") && pwd)

envfile=${1:-}

if [ -z "$envfile" ]; then
  echo "Usage: $0 <envfile>"
  echo "You can download the 'portal.env' file from 1Password:"
  echo "  https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com"
  exit 1
fi

secret="kblocks-api-secrets"
kubectl delete secret "$secret" 2> /dev/null || true
kubectl create secret generic "$secret" --from-env-file="$envfile"
kubectl delete secret "$secret" -n kblocks 2> /dev/null || true
kubectl create secret generic "$secret" -n kblocks --from-env-file="$envfile"
