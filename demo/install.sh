#!/bin/bash
helm dependency update
helm upgrade --install demo .