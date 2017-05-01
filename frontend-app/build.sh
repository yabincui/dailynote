#!/bin/bash
set -ex
npm run build
cp build/static/js/*.js build/static/js/main.js
