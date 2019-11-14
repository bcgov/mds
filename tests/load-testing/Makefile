#!make

test-web-local:
	@locust -f locust/web_locust_file.py --host=http://localhost:3000

test-web-prod:
	@locust -f locust/web_locust_file.py --host=https://mds-empr-mds-prod.pathfinder.gov.bc.ca

test-web-test:
	@locust -f locust/web_locust_file.py --host=https://mds-empr-mds-test.pathfinder.gov.bc.ca


#api tests
test-api-local:
	@locust -f locust/api_locust_file.py --host=http://localhost:5000

test-api-prod:
	@locust -f locust/api_locust_file.py --host=https://mds-empr-mds-prod.pathfinder.gov.bc.ca/api