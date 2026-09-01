#!/bin/sh
set -e
cd "$(dirname "$0")/.."
test -d .venv || python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -e .
