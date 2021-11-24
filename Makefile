#!make
#========================================================================#
# MDS Project Makefile
# Synopsis: This makefile acts as the main entrypoint for working with MDS
# Run 'make validate' to ensure your environment is configured correctly
#========================================================================#


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

buildlite:
	@echo "+\n++ Building minimum topology for local ...\n+"

buildall:
	@echo "+\n++ Performing project build ...\n+"
	@docker-compose build --force-rm --no-cache --parallel

buildbackend:
	@echo "+\n++ Building only backend ...\n+"

buildextra:
	@echo "+\n++ Building tertiary services ...\n+"

# Simply for legacy support, this command will be retired shortly
buildfe:
	@echo "+\n++ Removing frontend docker container and building local dev version ...\n+"
	@docker-compose rm -f -v -s frontend
	@rm -rf ./services/core-web/node_modules/
	@cd ./services/core-web/; npm i; npm run serve; cd ..

builddb:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --parallel postgres flyway

getdb:
	@echo "+\n++ Getting database dump from test environment...\n+"
	@sh ./bin/database-dump-from-test.sh 4c2ba9-test pgDump-test.sql

seeddb:
	@echo "+\n++ Seeding docker database...\n+"
	@docker cp pgDump-test.sql mds_postgres:/tmp/
	@docker exec -it mds_postgres sh -c "dropdb --user=mds --if-exists mds" || true
	@docker exec -it mds_postgres sh -c "createdb --user=mds mds" || true
	@docker exec -it mds_postgres sh -c "psql -U mds -ac 'GRANT ALL ON DATABASE "mds" TO "mds";'"
	@docker exec -it mds_postgres sh -c "gunzip -c  /tmp/pgDump-test.sql | psql -v -U mds -d mds" || true
	@docker exec -it mds_postgres sh -c "psql -U mds -ac 'REASSIGN OWNED BY postgres TO mds;';"

reglogin:
	@echo "+\n++ Initiating registry login...\n+"
	@./bin/registry-login.sh

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
