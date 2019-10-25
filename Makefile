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
	@[ ! -f ./frontend/.env ] || cp ./frontend/.env ./frontend/.env-last-backup
	@cp ./frontend/.env-dev-local-keycloak ./frontend/.env
	@[ ! -f "./frontend/src/constants/environment.js" ] || cp ./frontend/src/constants/environment.js ./frontend/src/constants/environment.js-last-backup
	@cp ./frontend/src/constants/environment.js-dev-local-keycloak ./frontend/src/constants/environment.js
	@[ ! -f "./python-backend/.env" ] || cp ./python-backend/.env ./python-backend/.env-last-backup
	@cp ./python-backend/.env-dev-local-keycloak ./python-backend/.env
	@[ ! -f "./microservices/nris_api/backend/.env" ] || cp ./microservices/nris_api/backend/.env ./microservices/nris_api/backend/.env-last-backup
	@cp ./microservices/nris_api/backend/.env-dev-local-keycloak ./microservices/nris_api/backend/.env
else
	@if "$(KC_HOST_ENTRY)" GTR "" (echo "hosts entry already exists") else (echo 127.0.0.1        localhost       keycloak >> C:\Windows\System32\drivers\etc\hosts)
	@if exist .\frontend\.env copy /Y .\frontend\.env .\frontend\.env-last-backup
	@copy /Y .\frontend\.env-dev-local-keycloak .\frontend\.env
	@if exist .\frontend\src\constants\environment.js copy /Y .\frontend\src\constants\environment.js .\frontend\src\constants\environment.js-last-backup
	@copy /Y .\frontend\src\constants\environment.js-dev-local-keycloak .\frontend\src\constants\environment.js
	@if exist .\python-backend\.env copy .\python-backend\.env .\python-backend\.env-last-backup
	@copy /Y .\python-backend\.env-dev-local-keycloak .\python-backend\.env
	@if exist .\microservices\nris_api/backend\.env copy .\microservices\nris_api\backend\.env .\microservices\nris_api\backend\.env-last-backup
	@copy /Y .\microservices\nris_api\backend\.env-dev-local-keycloak .\microservices\nris_api\backend\.env
endif
	@echo "+"

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
	@rm -rf ./frontend/node_modules/
	@cd ./frontend/; npm i; npm run serve; cd ..

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
