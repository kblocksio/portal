#!/bin/bash
set -eu
qkube use portal-backend.quickube.sh
skaffold run
