# resty.js example

## Folder Structure 

```
src
│   main.ts         # Application entry point
└───controllers     # route controllers for all the endpoints of the app
└───models          # TypeORM Entities

```

## Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

### Install

- Install all dependencies with `yarn install`

### Running in dev mode

- Run `yarn start` 
- The server address will be displayed to you as `http://0.0.0.0:8080`

### Building the project and run it

- Run `yarn build` to generated all JavaScript files from the TypeScript sources.
- the builded app located in `dist`.
