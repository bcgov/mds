#!make

backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:	stop | clean
database-seed: database-dump | database-dump-seed | database-dump-clean
database-seed-local: database-dump | database-dump-seed-local | database-dump-clean

project-build:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm

project-run:
	@echo "+\n++ Running project...\n+"
	@docker-compose up -d

backend-build:
	@echo "+\n++ Performing backend build ...\n+"
	@docker-compose build --force-rm backend

backend-run:
	@echo "+\n++ Running backend app...\n+"
	@docker-compose up -d backend

backend-entry:
	@echo "+\n++ Entering backend container ...\n+"
	@docker exec -it mds_backend bash

database-build:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --force-rm postgres

database-run:
	@echo "+\n++ Running postgres...\n+"
	@docker-compose up -d postgres

frontend-build:
	@echo "+\n++ Performing frontend build ...\n+"
	@docker-compose build --force-rm frontend

frontend-run:
	@echo "+\n++ Running frontend...\n+"
	@docker-compose up -d frontend

database-dump:
	@echo "+\n++ Getting database dump from test environment...\n+"
	@sh ./openshift/scripts/database-dump.sh empr-mds-test pgDump-test

database-dump-seed:
	@echo "+\n++ Seeding docker database...\n+"
	@docker cp pgDump-test.pgCustom mds_postgres:/tmp/
	@docker exec -it mds_postgres pg_restore -U mds -d mds -c /tmp/pgDump-test.pgCustom

database-dump-seed-local:
	@echo "+\n++ Seeding locally installed database...\n+"
	@pg_restore -U mds -d mds -c pgDump-test.pgCustom

database-dump-clean:
	@echo "+\n++ Removing dump file...\n+"
	@rm -f pgDump-test.pgCustom

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose rm -f -v -s