#!/bin/bash
set -eu
qkube use staging.quickube.sh
skaffold run
