# resty.js example

## Folder Structure

```
src
│   main.ts         # Application entry point
└───controllers     # route controllers for all the endpoints of the app

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

## Using the REST API

You can access the REST API of the server using the following endpoints:

### `GET`

- `/post/:id`: Fetch a single post by its `id`
- `/feed`: Fetch all _published_ posts
- `/filterPosts?searchString={searchString}`: Filter posts by `title` or `content`

### `POST`

- `/post`: Create a new post
  - Body:
    - `title: String` (required): The title of the post
    - `content: String` (optional): The content of the post
    - `authorEmail: String` (required): The email of the user that creates the post
- `/user`: Create a new user
  - Body:
    - `email: String` (required): The email address of the user
    - `name: String` (optional): The name of the user

### `PUT`

- `/publish/:id`: Publish a post by its `id`

### `DELETE`

- `/post/:id`: Delete a post by its `id`
