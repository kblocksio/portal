#!/bin/sh
set -euo pipefail

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
  echo "Usage: $0 <ip> <host>"
  exit 1
fi

ip=$1
host=$2

echo "Adding $host in /etc/hosts to point to $ip"
cat /etc/hosts | grep -v "$host" > /tmp/hosts
echo "$ip $host" >> /tmp/hosts
sudo cp /etc/hosts /etc/hosts.bak
sudo cp /tmp/hosts /etc/hosts
