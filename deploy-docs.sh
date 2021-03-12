#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist


git init
git add -A
git commit -m 'deploy'

git push -f https://github.com/Sanofi-IADC/glisten.git  master:gh-pages

cd -