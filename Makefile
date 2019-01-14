#!make

ifeq ($(OS),Windows_NT)

ifneq ($(strip $(filter %sh,$(basename $(realpath $(SHELL))))),)
POSIXSHELL := 1
else
POSIXSHELL :=
endif

else
# not on windows:
POSIXSHELL := 1
endif

local-dev: one-time-local-dev-env-setup
restore-dev: restore-last-env
rebuild-all-local: reset | project pause-30 create-local-keycloak-users generate-rand1000 rebuild-all-local-friendly-message
backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:	stop | clean
database-seed: database-dump | database-dump-seed
database-seed-local: database-dump | database-dump-seed-local

start-logstash:
	@echo "+\n++ This will start elasticsearch's logstash\n"
	@echo "++ based off the /elastic/logstash/pipeline/mds.logstash.conf file \n"
	@echo "++ You need to configure this mds.logstash.conf file first.\n+"
	@echo "++ [CTRL]-[C] to exit ...\n+"
	@logstash -f elastic/logstash/pipeline/mds.logstash.conf

one-time-local-dev-env-setup:
	@echo "+\n++ Setting up your local development environment\n"
	@echo "++ with local authentication and db.  Run this once only.\n"
	@echo "++ Your last configuration was saved to *-last-backup ...\n+"

ifneq ($(POSIXSHELL),)
	@[ ! -f ./elastic/.env ] ||cp ./elastic/.env ./elastic/.env-last-backup
	@cp ./elastic/.env-sample ./elastic/.env
	@[ ! -f ./frontend/.env ] ||cp ./frontend/.env ./frontend/.env-last-backup
	@cp ./frontend/.env-dev-local-keycloak ./frontend/.env
	@[ ! -f "./frontend/src/constants/environment.js" ] || cp ./frontend/src/constants/environment.js ./frontend/src/constants/environment.js-last-backup
	@cp ./frontend/src/constants/environment.js-dev-local-keycloak ./frontend/src/constants/environment.js
	@[ ! -f "./python-backend/.env" ] || cp ./python-backend/.env ./python-backend/.env-last-backup
	@cp ./python-backend/.env-dev-local-keycloak ./python-backend/.env
else
	@if exist .\elastic\.env copy /Y .\elastic\.env .\elastic\.env-last-backup
	@copy /Y .\elastic\.env-sample .\elastic\.env
	@if exist .\frontend\.env copy /Y .\frontend\.env .\frontend\.env-last-backup
	@copy /Y .\frontend\.env-dev-local-keycloak .\frontend\.env
	@if exist .\frontend\src\constants\environment.js copy /Y .\frontend\src\constants\environment.js .\frontend\src\constants\environment.js-last-backup
	@copy /Y .\frontend\src\constants\environment.js-dev-local-keycloak .\frontend\src\constants\environment.js
	@if exist .\python-backend\.env copy .\python-backend\.env .\python-backend\.env-last-backup
	@copy /Y .\python-backend\.env-dev-local-keycloak .\python-backend\.env
endif
	

restore-last-env:
	@echo "+\n++ Restoring your environment from last backup...\n+"
	@cp ./frontend/.env-last-backup ./frontend/.env
	@cp ./frontend/src/constants/environment.js ./frontend/src/constants/environment.js-last-backup
	@cp ./python-backend/.env-last-backup ./python-backend/.env

pause-30:
	@echo "+\n++ Pausing 30 seconds\n+"
ifneq ($(POSIXSHELL),)	
	@sleep 30
else
	@timeout 30
endif

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

generate-rand1000:
	@echo "+\n++ Generating 1000 random mine records in local database container...\n+"
	@docker exec -it mds_backend bash -c "flask create_data 1000;"

generate-rand100:
	@echo "+\n++ Generating 100 random mine records in local database container...\n+"
	@docker exec -it mds_backend bash -c "flask create_data 100;"

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
