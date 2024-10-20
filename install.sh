#!/bin/bash
set -euo pipefail
qkube use portal-backend.quickube.sh
skaffold run
