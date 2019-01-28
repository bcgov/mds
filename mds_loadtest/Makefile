#!make

#test-web:
#	@locust -f scripts/web_locust_file.py --host=$(WEB_URL)

test-web-local:
	@locust -f scripts/web_locust_file.py --host=http://localhost:3000

test-web-prod:
	@locust -f scripts/web_locust_file.py --host=https://mds-empr-mds-prod.pathfinder.gov.bc.ca

test-web-test:
	@locust -f scripts/web_locust_file.py --host=https://mds-empr-mds-test.pathfinder.gov.bc.ca


#api tests
test-api-local:
	@locust -f scripts/api_locust_file.py --host=http://localhost:5000

test-api-prod:
	@locust -f scripts/api_locust_file.py --host=https://mds-empr-mds-prod.pathfinder.gov.bc.ca/api