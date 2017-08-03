#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

if [ ! -f out/VoteExtractor.output.json ]; then
    python vote_extractor.py ../../data out
fi
if [ ! -f out/BillFinder.output.json ]; then
    python bill_finder.py ../../data out bill Taiwan China
fi
if [ ! -f out/CongressMemberFeatures.output.tsv ]; then
    python congress_member_features.py out/VoteExtractor.output.json \
        out/BillFinder.output.json out
fi
