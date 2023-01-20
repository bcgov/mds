# Multi Client JWT OIDC Manager for Flask

### History:

`core-api` uses `flask_jwt_oidc` for it's jwt parsing, validation and role checking. This is a fiarly opinionated library and works only on flask and depends on the `config` of the flask app.

specifically, with support for the following variables in the config file:

```
class Config(object):

    JWT_OIDC_WELL_KNOWN_CONFIG = env.get('JWT_OIDC_WELL_KNOWN_CONFIG')
    JWT_OIDC_AUDIENCE = env.get('JWT_OIDC_AUDIENCE')
    JWT_OIDC_CLIENT_SECRET = env.get('JWT_OIDC_CLIENT_SECRET')
```

as mentioned [here](https://github.com/thorwolpert/flask-jwt-oidc#configuration)

Github: [flask_jwt_oidc](https://github.com/thorwolpert/flask-jwt-oidc/tree/main/flask_jwt_oidc)

This works well as long as we have only a single oidc client integration for one flask app.

### The problem:

As part of the OCIO mandate to migrate gov apps to [Gold SSO](https://bcgov.github.io/sso-requests) we now have to support multiple oidc integration clients/audience due to the architecture pattern of Gold SSO.

Earlier in our own keycloak realm of `mds` all the integration clients - webapps and service accounts on each environment had ONE audience viz.

`mines-application-local`,
`mines-application-dev`,
`mines-application-test`, and
`mines-application-prod`

Now, with each integration has a different audience **`within the same environment.`**

core-web - `mines-digital-services-mds-public-client-4414`
bcmi - `mines-digital-services-mds-bcmi-xxxx`
databc - `mines-digital-services-mds-databc-xxxx` etc..

Our JWT parsing and authentication, authorization will need to support this.

> **TLDR:** `flask_jwt_oidc` needs to be enahnced to support multiple oidc audience.

### Solution:

`flask_jwt_oidc_local` folder is a copy of the core `jwt_manager` implementation from the `flask_jwt_oidc`. This is extended to support multiple odic audience.

Currently, we have the implementation upgraded locally.

The upgraded jwt manager does the follwing:

- Create multiple instances of the JWT manager using the class contructor
- Does not depend on config.py
- JWT manager swithcing implementation to pick the right manager for a given token.

### Improvements:

**The best practice is to fork the library, upgrade it to support:**

Fork for mds here: [flask-jwt-oidc](https://github.com/bcgov/flask-jwt-oidc)
Published to PyPi here: [flask-jwt-oidc-mds](https://pypi.org/project/flask-jwt-oidc-mds)

scope for improvement:

- Move the implementation to the fork
- Write multi jwt manager test cases in the fork
- publish to PyPi
- Pull libraries from PyPi into core-api

### Risks:

**Essentially none.**

We don't get to miss our much on upgrades to the original library due to the following reasons:

- The `flask-jwt-oidc` library is not actively maintained with constant updates.
- It is purpose built for flask and BC Gov use cases.
- Upgrades are more opportunistic (for vesion changes, etc) rather than full integration compatibility.
