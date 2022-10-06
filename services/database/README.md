### Postgres 13 Database. 


This postgres database is built out of a generic Postgres 13 image. 

It is used as a common image for the following workloads 

- Fider 
- Metabase


The main postgres 13 DB used by core-api is built a little different, including oracle fdw, which is not required for other application databases. 