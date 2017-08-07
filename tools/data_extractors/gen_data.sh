#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

config=$1

python vote_extractor.py $config
python bill_finder.py $config
python congress_member_features.py $config
