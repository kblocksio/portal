#!/bin/sh
set -eu pipefail
root=$(cd $(dirname $0) && pwd)

envfile=${1:-}

if [ -z "$envfile" ]; then
  echo "Usage: $0 <envfile>"
  echo "You can download the 'kblocks-gallery.env' file from 1Password:"
  echo "  https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com"
  exit 1
fi

# TODO: infer KBLOCKS_SYSTEM_ID from the current kubectl context, but for now we have `demo` hardcoded in many places
# KBLOCKS_SYSTEM_ID=$(kubectl config current-context)
if [ -z "${KBLOCKS_SYSTEM_ID:-}" ]; then
  echo "KBLOCKS_SYSTEM_ID must be set with the system id (e.g. 'demo')"
  exit 1
fi

namespace="kblocks"
secret="kblocks-secrets"

# create the "kblocks" namespace if it doesn't exist
kubectl create namespace $namespace 2>/dev/null || true

kubectl delete secret $secret -n $namespace || true
echo "Creating secret $secret from $envfile"
cat $envfile
kubectl create secret generic $secret --from-env-file=$envfile -n $namespace
echo "Secret $secret created"
# by default blocks read the system id from the "kblocks-system" configmap, so we just need to put
# it there and the blocks will all use it from there.
system_config="kblocks-system"
kubectl delete configmap $system_config -n $namespace 2>/dev/null || true
kubectl create configmap $system_config -n $namespace --from-literal=KBLOCKS_SYSTEM_ID=$KBLOCKS_SYSTEM_ID
