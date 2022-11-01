#!make
#========================================================================#
# MDS Project Makefile
# Synopsis: This makefile acts as the main entrypoint for working with MDS
# Run 'make help' to start
#========================================================================#

# Determine OS
ifneq ($(OS),Windows_NT)
POSIXSHELL := 1
else
POSIXSHELL :=
endif

export ARCH:=$(shell uname -m)

ifeq ($(ARCH), arm64) 
DC_FILE:=-f docker-compose.M1.yaml
else
DC_FILE:=-f docker-compose.yaml
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
	@docker-compose $(DC_FILE) up -d --build frontend

rebuild:
	@echo "+\n++ Rebuilding your current in-use containers ...\n+"
	@./bin/rebuild.sh

all:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose $(DC_FILE) build --force-rm --no-cache --parallel
	@docker-compose $(DC_FILE) up -d

be:
	@echo "+\n++ Building only backend ...\n+"
	@docker-compose $(DC_FILE) up -d backend

testbe:
	@echo "+\n++ Running tests in backend container ...\n+"
	@docker-compose $(DC_FILE) exec backend pytest

testbe_folder:
	@echo "+\n++ Running $f tests in backend container ...\n+"
	@docker-compose $(DC_FILE) exec backend pytest -s --disable-warnings tests/$f

testfe:
	@echo "+\n++ Running tests in frontend container ...\n+"
	@docker-compose $(DC_FILE) exec frontend yarn test

testms:
	@echo "+\n++ Running tests in minespace container ...\n+"
	@docker-compose $(DC_FILE) exec minespace yarn test

ms:
	@echo "+\n++ Building minespace ...\n+"
	@docker-compose $(DC_FILE) up -d minespace

extra:
	@echo "+\n++ Building tertiary services ...\n+"
	@docker-compose $(DC_FILE) up -d minespace docgen-api

# Simply for legacy support, this command will be retired shortly
fe:
	@echo "+\n++ Removing frontend docker container and building local dev version ...\n+"
	@docker-compose $(DC_FILE) rm -f -v -s frontend
	@rm -rf ./services/core-web/node_modules/
	@cd ./services/core-web/; yarn; yarn serve; cd ..

db:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose $(DC_FILE) up -d postgres flyway

cleandb:
	@echo "+\n++ Cleaning database ...\n+"
	@docker-compose $(DC_FILE) stop postgres flyway
	@docker-compose $(DC_FILE) rm -f -v -s postgres flyway
	@docker rmi -f mds_postgres mds_flyway
	@docker volume rm mds_postgres_data -f
	@docker-compose $(DC_FILE) up -d postgres flyway

reglogin:
	@echo "+\n++ Initiating Openshift registry login...\n+"
	@./bin/registry-login.sh

mig:
	@echo "+\n++ Applying migrations...\n+"
	@docker-compose $(DC_FILE) stop flyway
	@docker-compose $(DC_FILE) build --force-rm --no-cache flyway
	@docker-compose $(DC_FILE) up --always-recreate-deps --force-recreate -d flyway

#TODO: unstable command - need to review relationship checks among factories
seeddb:
	@echo "+\n++ Seeding db with factory data...\n+"
	@docker-compose $(DC_FILE) exec -d backend bash -c "flask create-data 25;"

env:
	@echo "+\n++ Creating boilerplate local dev .env files...\n+"
	@./bin/setenv.sh

stop:
	@echo "+\n++ Stopping all containers...\n+"
	@docker-compose $(DC_FILE) down

clean: stop |
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose $(DC_FILE) rm -f -v -s
	@docker rmi -f mds_postgres mds_backend mds_frontend mds_flyway
	@docker volume rm mds_postgres_data -f

help:
	@./bin/help.sh
