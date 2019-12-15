#!make

ifneq ($(OS),Windows_NT)
POSIXSHELL := 1
KC_HOST_ENTRY := $(shell grep "keycloak" /etc/hosts)
else
POSIXSHELL :=
KC_HOST_ENTRY := $(shell findstr "keycloak" C:\Windows\System32\drivers\etc\hosts)
endif

local-dev: one-time-local-dev-env-setup
restore-dev: restore-last-env
rebuild-all-local: reset | project pause-30 create-local-keycloak-users generate-rand100 rebuild-all-local-friendly-message
backend: backend-build | backend-run
database: database-build | database-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:  stop | clean
database-seed: database-dump | database-dump-seed
database-seed-local: database-dump | database-dump-seed-local

one-time-local-dev-env-setup:
	@echo "+\n++ Setting up your local development environment"
	@echo "++ with local authentication and db.  Run this once only."
	@echo "++ Your last configuration files were saved with the ending '*-last-backup'."
ifneq ($(POSIXSHELL),)
ifeq ($(KC_HOST_ENTRY),)
	@echo "++ Adding required keycloak entry to hosts file:"
	@echo "127.0.0.1       localhost       keycloak" | sudo tee -a /etc/hosts;
endif
	@[ ! -f ./services/core-web/.env ] || cp ./services/core-web/.env ./services/core-web/.env-last-backup
	@cp ./services/core-web/.env-dev-local-keycloak ./services/core-web/.env
	@[ ! -f "./services/core-web/src/constants/environment.js" ] || cp ./services/core-web/src/constants/environment.js ./services/core-web/src/constants/environment.js-last-backup
	@cp ./services/core-web/src/constants/environment.js-dev-local-keycloak ./services/core-web/src/constants/environment.js
	@[ ! -f "./services/core-api/.env" ] || cp ./services/core-api/.env ./services/core-api/.env-last-backup
	@cp ./services/core-api/.env-dev-local-keycloak ./services/core-api/.env
	@[ ! -f "./services/nris-api/backend/.env" ] || cp ./services/nris-api/backend/.env ./services/nris-api/backend/.env-last-backup
	@cp ./services/nris-api/backend/.env-dev-local-keycloak ./services/nris-api/backend/.env
	@[ ! -f "./services/document-manager/backend/.env" ] || cp ./services/document-manager/backend/.env ./services/document-manager/backend/.env-last-backup
	@cp ./services/document-manager/backend/.env-dev-local-keycloak ./services/document-manager/backend/.env
else
	@if "$(KC_HOST_ENTRY)" GTR "" (echo "hosts entry already exists") else (echo 127.0.0.1        localhost       keycloak >> C:\Windows\System32\drivers\etc\hosts)
	@if exist .\services\core-web\.env copy /Y .\services\core-web\.env .\services\core-web\.env-last-backup
	@copy /Y .\services\core-web\.env-dev-local-keycloak .\services\core-web\.env
	@if exist .\services\core-web\src\constants\environment.js copy /Y .\services\core-web\src\constants\environment.js .\services\core-web\src\constants\environment.js-last-backup
	@copy /Y .\services\core-web\src\constants\environment.js-dev-local-keycloak .\services\core-web\src\constants\environment.js
	@if exist .\services\core-api\.env copy .\services\core-api\.env .\services\core-api\.env-last-backup
	@copy /Y .\services\core-api\.env-dev-local-keycloak .\services\core-api\.env
	@if exist .\services\nris-api/backend\.env copy .\services\nris-api\backend\.env .\services\nris-api\backend\.env-last-backup
	@copy /Y .\services\nris-api\backend\.env-dev-local-keycloak .\services\nris-api\backend\.env
	@if exist .\services\document-manager\backend\.env copy .\services\document-manager\backend\.env .\services\document-manager\backend\.env-last-backup
	@copy /Y .\services\document-manager\backend\.env-dev-local-keycloak .\services\document-manager\backend\.env
endif
	@echo "+"

restore-last-env:
	@echo "+\n++ Restoring your environment from last backup...\n+"
	@cp ./services/core-web/.env-last-backup ./services/core-web/.env
	@cp ./services/core-web/src/constants/environment.js ./services/core-web/src/constants/environment.js-last-backup
	@cp ./services/core-api/.env-last-backup ./services/core-api/.env
	@cp ./services/nris-api/backend/.env-last-backup ./services/nris-api/backend/.env
	@cp ./services/document-manager/backend/.env-last-backup ./services/document-manager/backend/.env

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
	@echo "+\n++ mds_frontend will be available at http://localhost:3000"
	@echo "++ mds_backend will be available at http://localhost:5000"
	@echo "++ mds_postgres will be available at http://localhost:5432"
	@echo "++ mds_keycloak will be available at http://keycloak:8080\n+"

project-build:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel

project-run:
	@echo "+\n++ Running project...\n+"
	@docker-compose up -d

backend-build:
	@echo "+\n++ Performing backend build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel backend

backend-run:
	@echo "+\n++ Running backend app...\n+"
	@docker-compose up -d backend

backend-entry:
	@echo "+\n++ Entering backend container ...\n+"
	@docker exec -it mds_backend bash

cache:
	@echo "+\n++ Running redis...\n+"
	@docker-compose up -d redis

database-build:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --parallel postgres flyway

database-run:
	@echo "+\n++ Running postgres and Flyway migrations...\n+"
	@docker-compose up -d postgres flyway

webpack-frontend:
	@echo "+\n++ Removing frontend docker container and building local dev version ...\n+"
	@docker-compose rm -f -v -s frontend
	@rm -rf ./services/core-web/node_modules/
	@cd ./services/core-web/; npm i; npm run serve; cd ..

frontend-build:
	@echo "+\n++ Performing frontend build ...\n+"
	@docker-compose build frontend

frontend-run:
	@echo "+\n++ Running frontend...\n+"
	@docker-compose up -d frontend

database-dump:
	@echo "+\n++ Getting database dump from test environment...\n+"
	@sh ./bin/database-dump.sh empr-mds-test pgDump-test

database-dump-seed:
	@echo "+\n++ Seeding docker database...\n+"
	@docker cp pgDump-test.pgCustom mds_postgres:/tmp/
	@docker exec -it mds_postgres pg_restore -U mds -d mds -c /tmp/pgDump-test.pgCustom

database-dump-seed-local:
	@echo "+\n++ Seeding locally installed database...\n+"
	@pg_restore -U mds -d mds -c pgDump-test.pgCustom

generate-rand1000:
	@echo "+\n++ Generating 1000 random mine records in local database container...\n+"
	@docker exec -it mds_backend bash -c "flask create-data 1000;"

generate-rand100:
	@echo "+\n++ Generating 100 random mine records in local database container...\n+"
	@docker exec -it mds_backend bash -c "flask create-data 100;"

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
	@docker rmi -f mds_postgres mds_backend mds_frontend mds_flyway
	@docker volume rm mds_postgres-data -f

clean-db: stop |
	@docker rmi -f mds_flyway
	@docker volume rm mds_postgres-data -f
