### Schema Spy

#### Repo 

Based on the BCGOV repo - https://github.com/bcgov/SchemaSpy

Some modifications implemented to suit mds project. Not a direct copy. 

Changes to caddy file. 

#### Image build

Run build inside `schemaspy` folder

- `docker build . -t schemaspy`
- `docker tag schemaspy:latest image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/schemaspy:latest`
- `docker push --all-tags image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/schemaspy`