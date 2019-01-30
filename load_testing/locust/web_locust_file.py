from locust import HttpLocust, TaskSet, seq_task, task
from config import Config


BEARER_TOKEN_STRING ="Bearer " + Config.BEARER_TOKEN
MINE_GUID = Config.MINE_GUID


class UserBehavior(TaskSet):

    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        print("Started")

    def on_stop(self):
        """ on_stop is called when the TaskSet is stopping """
        print("Stopped")

    @task(1)
    def home(self):
        self.client.get("/",headers={"Authorization": BEARER_TOKEN_STRING})

    #Perform search and filters
    @task(1)
    def search(self):
        self.client.get("/dashboard?page=1&per_page=25&search=apple&commodity=&region=&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})
    @task(1)
    def search_tenure_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&search=&commodity=&region=&status=&tenure=COL",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_status_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&search=&commodity=&region=&status=ABN&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_region_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&search=&commodity=&region=SC&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_commodity_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&search=&commodity=TO&region=&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_region_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&search=&commodity=&region=SC&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_major_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&major=true&commodity=&region=&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def search_tsf_filter(self):
        self.client.get("/dashboard?page=1&per_page=25&tsf=true&commodity=&region=&status=&tenure=",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    #Test map response
    @task(1)
    def map(self):
        self.client.get("/dashboard?page=1&per_page=25&map=true",
                        headers={"Authorization": BEARER_TOKEN_STRING})

    #Load mine page tabs
    @task(1)
    def mine_summary_page(self):
        self.client.get("/"+MINE_GUID+"/summary", headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def mine_permit_page(self):
        self.client.get("/"+MINE_GUID+"/permit", headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def mine_contact_info_page(self):
        self.client.get("/"+MINE_GUID+"/contact-information", headers={"Authorization": BEARER_TOKEN_STRING})

    @task(1)
    def mine_compliance_page(self):
        self.client.get("/"+MINE_GUID+"/compliance", headers={"Authorization": BEARER_TOKEN_STRING})


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000