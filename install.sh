#!/bin/sh
set -euo pipefail
tag="wingcloudbot/portal-backend"

docker build -t $tag .
docker push $tag

helm upgrade --install portal-backend --set image=$tag ./deploy
