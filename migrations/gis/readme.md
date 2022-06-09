# GIS materialized view. 


This folder is to maintain the view that has to be run manually once in all environments. 

Any changes to this view needs to be applied to all env manually

Backup restores contain this view through the backup files

### Issues: 

Including this migration in the normal /sql migrations causes issues due to the following reasons:

1. Test database does not have NRIS schema 
2. GIS View depends on NRIS schema 
3. Migration would fail in CI pipelines since NRIS schema does not exist
4. We cannot run flyway migration seprately and would have to couple with NRIS alembic migrations. 
5. Need to introduce NRIS and CORE-API coupling.

### Potential Solutions: 

1. Cross service database artifacts could have their own migration service