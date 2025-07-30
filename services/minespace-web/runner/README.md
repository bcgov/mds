# MineSpace Express runner

A custom express web server using a [Node.js (v20)](https://nodejs.org/en/) or newer runtime for serving Minespace.

For local testing to get it as close to the dev environment as possible, you can do the following:

1. Update `NODE_ENV` environment variable in `.env` file to `production`
2. Build app `yarn workspace @mds/minespace-web build`
3. Copy `.env` file into the `services/minespace-web/runner` directory (ensure `KEYCLOAK_IDP_HINT` is set)
4. Run the runner app: `node server.js`
