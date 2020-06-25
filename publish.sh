#!/bin/sh

yarn
yarn build

rm -rf dist
mkdir dist 
mkdir dist/core
mkdir dist/typeorm
mkdir dist/jwt

cp -r packages/core/dist/ dist/core
cp packages/core/package.json dist/core 
# cp README.md dist/core 

cp -r packages/typeorm/dist/ dist/typeorm
cp packages/typeorm/package.json dist/typeorm 
# cp README.md dist/typeorm 

cp -r packages/jwt/dist/ dist/jwt
cp packages/jwt/package.json dist/jwt 
# cp README.md dist/jwt 