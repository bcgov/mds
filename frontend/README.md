# Frontend application

The project uses a [Node.js (v8)](https://nodejs.org/en/) runtime environment and [React.js](https://reactjs.org/) library for the frontend.

## Module and Library dependencies

The application requires a whole suite of npm modules for building/testing/running the application. All the required modules can be found under package.json file.

### Building

- [webpack](https://webpack.js.org/) : Project building and asset compilation.
- [babel](https://babeljs.io/) : Adds support for older browsers
- [sass](https://sass-lang.com/guide) : Clean CSS files

### Testing

- [jest](https://jestjs.io/) : Mocking and writing tests
- [enzyme](https://github.com/airbnb/enzyme) : Assert, manipulate and traverse react components

### Running

- [react](https://reactjs.org/) : JS library to build single page apps
- [redux](https://github.com/reduxjs/react-redux) : State management
- [prop-types](https://www.npmjs.com/package/prop-types) : Runtime object type check
- [axios](https://github.com/axios/axios) : Library to manage network calls


## Directory/Naming convention

The application naming convention is based off of [BEM](http://getbem.com/introduction/) and [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) naming convention and is structured as follows:

```
|-- public
    |-- Assets that are accessible by everyone on the internet.

|-- src (Source code of the application)
    |-- actionsCreators (Axios calls for retrieving data from an external source)
    |-- actions (JSON objects that are dispatched to the redux store)
    |-- assets (Static images, icons, fonts etc)
    |-- components (React components for the application)
    |-- constants (Global constants i.e. URLs, Keys etc.)
    |-- HOC (Higher order React components to be re-used)
    |-- reducers (Redux functions for handling data sets)
    |-- routes (React page routes)
    |-- selectors (Functions to retrieve data from the redux store)
    |-- store (Redux store with required middleware configurations)
    |-- styles (SCSS files for styling)
    |-- tests (Unit/Integration tests)
    |-- utils (Commonly used helper functions)
```

## Pre-requisites and Installation

The application assumes you already have a working python backend running.

Follow the `.env-example` template to create an `.env` file with valid values before running the application.

A. OS Level Installation
 - [Node.js 8](https://nodejs.org/en/download/)
 - [Canvas](https://www.npmjs.com/package/canvas)

1. Install package dependencies
```
npm install
```

2. Run the application
```
npm run serve
```

B. Using a docker container
 - [Docker](https://www.docker.com/)

1. Switch current directory to the project root
```
cd ../
```

2. Issue the makefile command that runs the frontend
```
make frontend
```