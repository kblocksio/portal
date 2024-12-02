#!/bin/sh
set -eu
root=$(cd $(dirname $0) && pwd)

envfile=${1:-}
cluster_envfile=${2:-}

if [ -z "$envfile" -o -z "$cluster_envfile" ]; then
  echo "Usage: $0 <envfile> <cluster-envfile>"
  echo "You can download the 'kblocks-gallery.env' and 'kblocks-cluster.env' files from 1Password:"
  echo "  https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com"
  exit 1
fi

echo "Environment file:"
echo "Creating from $envfile and $cluster_envfile"
cat $envfile
cat $cluster_envfile

# TODO: infer KBLOCKS_SYSTEM_ID from the current kubectl context, but for now we have `demo` hardcoded in many places
# KBLOCKS_SYSTEM_ID=$(kubectl config current-context)
if [ -z "${KBLOCKS_SYSTEM_ID:-}" ]; then
  echo "KBLOCKS_SYSTEM_ID must be set with the system id (e.g. 'demo')"
  exit 1
fi

namespace="kblocks"
secret="kblocks-secrets"
secret_cluster="kblocks"

# create the "kblocks" namespace if it doesn't exist
kubectl create namespace $namespace 2>/dev/null || true

kubectl delete secret $secret -n $namespace 2>/dev/null || true
kubectl create secret generic $secret --from-env-file=$envfile -n $namespace

# copy cluster env file to temp file and add KBLOCKS_SYSTEM_ID to it
tmp_cluster_envfile=$(mktemp)
cat $cluster_envfile > $tmp_cluster_envfile
echo "\nKBLOCKS_SYSTEM_ID=$KBLOCKS_SYSTEM_ID" >> $tmp_cluster_envfile

kubectl delete secret "$secret_cluster" -n $namespace 2> /dev/null || true
kubectl create secret generic "$secret_cluster" -n $namespace --from-env-file="$tmp_cluster_envfile"
