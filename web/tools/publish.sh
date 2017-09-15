#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
    echo "$0 takes one argument: version"
    exit -1
fi

dir=$1

echo "[Publisher] Removing dist/..."
rm -rf dist
mkdir dist

echo "[Publisher] Cloning gh-pages branch into dist/..."
origin=`git remote get-url origin`
git clone $origin --branch gh-pages dist
cd dist

republish=false
if [ -d "$dir" ]; then
    echo "[Publisher] Removing $dir/..."
    git rm -r $dir
    republish=true
fi

echo "[Publisher] Copying content to $dir/..."
rsync -av --prune-empty-dirs --exclude="scripts/uscva*.js" ../public/ $dir

echo "[Publisher] Bundling and copying prod version of uscva.js..."
npm run bundle-prod
mkdir -p $dir/scripts
cp ../public/scripts/uscva.prod.js $dir/scripts/uscva.js

echo "[Publisher] Checking in $dir/..."
git add .
if [ "$republish" == true ]; then
    git commit -m "Republish $dir."
else
    git commit -m "Publish $dir."
fi

echo "[Publisher] Pushing $dir/ to remote..."
git push origin gh-pages
