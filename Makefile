#!make

backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:	stop | clean
database-seed: database-dump | database-dump-seed
database-seed-local: database-dump | database-dump-seed-local

project-build:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm --no-cache

project-run:
	@echo "+\n++ Running project...\n+"
	@docker-compose up -d

backend-build:
	@echo "+\n++ Performing backend build ...\n+"
	@docker-compose build --force-rm --no-cache backend

backend-run:
	@echo "+\n++ Running backend app...\n+"
	@docker-compose up -d backend

backend-entry:
	@echo "+\n++ Entering backend container ...\n+"
	@docker exec -it mds_backend bash

database-build:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --force-rm --no-cache postgres

database-run:
	@echo "+\n++ Running postgres...\n+"
	@docker-compose up -d postgres

frontend-build:
	@echo "+\n++ Performing frontend build ...\n+"
	@docker-compose build frontend

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

keycloak:
	@echo "+\n++ Running keycloak...\n+"
	@docker-compose up --force-recreate -d keycloak

keycloak-user:
	@echo "+\n++ Creating local admin user...\n+"
	@docker exec -it mds_keycloak /tmp/keycloak-local-user.sh

test:
	@echo "+\n++ Running functional test...\n+"
	@cd functional-tests && ./gradlew chromeTest -DchromeTest.single=CustomJUnitSpecRunner

test-headless:
	@echo "+\n++ Running functional test...\n+"
	@cd functional-tests && ./gradlew chromeHeadlessTest -DchromeHeadlessTest.single=CustomJUnitSpecRunner 

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose rm -f -v -s
	@docker rmi mds_postgres mds_backend mds_frontend