#!make

local-dev: one-time-local-dev-env-setup
restore-dev: restore-last-env
rebuild-all-local: reset project pause-30 create-local-keycloak-users database-generate-rand1000 rebuild-all-local-friendly-message
backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:	stop | clean
database-seed: database-dump | database-dump-seed
database-seed-local: database-dump | database-dump-seed-local

one-time-local-dev-env-setup:
	@echo "+\n++ Setting up your local development environment\n+"
	@echo "with local authentication and db.  Run this once only. ...\n+"
	@echo "Your last configuration was saved to *-last-backup ...\n+"
	@cp ./frontend/.env ./frontend/.env-last-backup
	@cp ./frontend/.env-dev-local-keycloak ./frontend/.env
	@cp ./frontend/src/constants/environment.js ./frontend/src/constants/environment.js-last-backup
	@cp ./frontend/src/constants/environment.js-dev-local-keycloak ./frontend/src/constants/environment.js
	@cp ./python-backend/.env ./python-backend/.env-last-backup
	@cp ./python-backend/.env-dev-local-keycloak ./python-backend/.env

restore-last-env:
	@echo "+\n++ Restoring your environment from last backup...\n+"
	@cp ./frontend/.env-last-backup ./frontend/.env
	@cp ./frontend/src/constants/environment.js ./frontend/src/constants/environment.js-last-backup
	@cp ./python-backend/.env-last-backup ./python-backend/.env

one-time-local-dev-env-setup:
	@echo "+\n++ Setting up your local development environment"
	@echo "++ with local user admin/admin, and random data ...\n+"

pause-30:
	@echo "+\n++ Pausing 30 seconds\n+"
	@sleep 30

create-local-keycloak-users:
	@echo "+\n++ Creating admin user... (admin/admin)\n+"
	@docker exec -it mds_keycloak /tmp/keycloak-local-user.sh

rebuild-all-local-friendly-message:
	@echo "+\n++ frontend will be available at http://localhost:3000"
	@echo "++ backend will be available at http://localhost:5000"
	@echo "++ Postgresql will be available at http://localhost:5432"
	@echo "++ Wait up to 5min or longer for MDS webapp to be available."
	@echo "++ If it loads with errors, wait longer for the backend to become available and refresh.\n+"

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
	@docker-compose build postgres

database-run:
	@echo "+\n++ Running postgres and Flyway migrations...\n+"
	@docker-compose up -d postgres flyway

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

database-generate-rand1000:
	@echo "+\n++ Generating 1000 random mine records in local database container...\n+"
	@docker exec -it mds_backend bash -c "flask create_data 1000;"

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
	@docker rmi -f mds_postgres mds_backend mds_frontend
	@docker volume rm mds_postgres-data -f