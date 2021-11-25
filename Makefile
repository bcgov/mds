#!make
#========================================================================#
# MDS Project Makefile
# Synopsis: This makefile acts as the main entrypoint for working with MDS
# Run 'make validate' to ensure your environment is configured correctly
#========================================================================#

# Determine OS
ifneq ($(OS),Windows_NT)
POSIXSHELL := 1
else
POSIXSHELL :=
endif

valid:
	@echo "+\n++ Checking your development environment is valid ...\n+"
ifneq ($(POSIXSHELL),)
	@./bin/validate.sh posix
else
	@./bin/validate.sh windows
endif

lite:
	@echo "+\n++ Building minimum topology for local dev ...\n+"

all:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel

backend:
	@echo "+\n++ Building only backend ...\n+"

extra:
	@echo "+\n++ Building tertiary services ...\n+"

# Simply for legacy support, this command will be retired shortly
fe:
	@echo "+\n++ Removing frontend docker container and building local dev version ...\n+"
	@docker-compose rm -f -v -s frontend
	@rm -rf ./services/core-web/node_modules/
	@cd ./services/core-web/; npm i; npm run serve; cd ..

db:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --parallel postgres flyway

getdb:
	@echo "+\n++ Getting database dump from test environment...\n+"
	@sh ./bin/database-dump-from-test.sh 4c2ba9-test pgDump-test.sql

seeddb:
	@echo "+\n++ Seeding docker database...\n+"


reglogin:
	@echo "+\n++ Initiating registry login...\n+"
	@./bin/registry-login.sh

reglogin:
	@echo "+\n++ Initiating registry login...\n+"
	@./bin/setenv.sh

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose rm -f -v -s
	@docker rmi -f mds_postgres mds_backend mds_frontend mds_flyway
	@docker volume rm mds_postgres_data -f

cleandb: stop |
	@docker rmi -f mds_flyway
	@docker volume rm mds_postgres_data -f

help:
	@./bin/help.sh
