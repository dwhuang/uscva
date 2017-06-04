#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

if [ $# -ne 1 ]; then
    echo $0 takes one argument: action to run in a loop
    echo Possible values: fetch, archive, extract, cleanup
    exit -1
fi

for i in {105..115}; do
    case $1 in
        fetch)
        rsync -avz --delete --delete-excluded --exclude **/text-versions/ \
            --exclude **/*.xml govtrack.us::govtrackdata/congress/$i .
        ;;
        archive)
        tar -zvcf $i.tgz $i/
        ;;
        extract)
        tar -zvxf $i.tgz
        ;;
        cleanup)
        rm -rf $i/
        ;;
        *)
        echo Unrecognized action $1
        exit -1
        ;;
    esac
done

