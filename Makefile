#!make

backend: backend-build | backend-run
backend-reset:	stop | clean

backend-build:
	@echo "+\n++ Performing backend build ...\n+"
	@docker-compose build

backend-run:
	@echo "+\n++ Running backend app and postgres...\n+"
	@docker-compose up -d

stop:
	@echo "+\n++ Stopping backend and postgres...\n+"
	@docker-compose down

clean:
	@echo "+\n++ Cleaning ...\n+"
	@docker rm -f $(docker ps -aq)