import json
from locust import HttpLocust, TaskSet, task
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

    #query all mines, get one page
    @task(1)
    def search_nothing(self):
        self.client.get("/mines?page=1&per_page=25", headers={"Authorization": BEARER_TOKEN_STRING})

    #Perform a search and filter
    @task(1)
    def search_and_filter(self):
        self.client.get("/mines?page=1&per_page=25&search=mine&region=SC", headers={"Authorization": BEARER_TOKEN_STRING})

    #Get map
    @task(1)
    def get_map(self):
        self.client.get("/mines?page=1&per_page=25&map=true", headers={"Authorization": BEARER_TOKEN_STRING})

    #Get mine summary data
    @task(1)
    def get_mine(self):
        self.client.get("/mines/" + MINE_GUID, headers={"Authorization": BEARER_TOKEN_STRING})

    #Get mine parties
    @task(1)
    def get_mine_parties(self):
        self.client.get("/parties/mines?mine_guid=" + MINE_GUID,
                              headers={"Authorization": BEARER_TOKEN_STRING})

    # #Get mine and compliance information
    # This remains commented out unless the tester wants to test the compliance response times.
    # Compliance testing relies on the NRIS database.
    # @task(2)
    # def get_mine_compliance(self):
    #     with self.client.get("/mines/"+constants.MINE_GUID, headers={"Authorization": BEARER_TOKEN_STRING}) as response:
    #         mine_data = json.loads(response.content)
    #         self.client.get("/mines/compliance/"+mine_data['mine_no'], headers={"Authorization": BEARER_TOKEN_STRING})

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000