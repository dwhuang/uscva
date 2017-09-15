# uscva viz
## Getting Started
1. brew update
2. brew install npm (or brew upgrade npm)
3. npm run bundle-dev (This starts webpack to continuously monitor and compile JS code into public/scripts/uscva.js.)
4. npm start (This starts http-server and opens public/index.html in a browser tab.)
5. Go break things

## Push New Version to Prod
npm run push-to-prod -- [version]

[version] can be any string. It's used to create (or recreate) a top-level directory on the gh-pages branch.
