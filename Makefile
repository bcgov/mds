#!make

backend: backend-build | backend-run
database: database-build | database-run
cache: cache-build | cache-run
frontend: frontend-build | frontend-run
project: project-build | project-run
rebuild: project-build
reset:	stop | clean

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

database-build:
	@echo "+\n++ Performing postgres build ...\n+"
	@docker-compose build --force-rm postgres

database-run:
	@echo "+\n++ Running postgres...\n+"
	@docker-compose up -d postgres

cache-build:
	@echo "+\n++ Performing redis build ...\n+"
	@docker-compose build --force-rm redis

cache-run:
	@echo "+\n++ Running redis...\n+"
	@docker-compose up -d redis

frontend-build:
	@echo "+\n++ Performing frontend build ...\n+"
	@docker-compose build --force-rm frontend

frontend-run:
	@echo "+\n++ Running frontend...\n+"
	@docker-compose up -d frontend

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker-compose rm -f -v -s