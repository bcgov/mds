import json

from app.extensions import db

from tests.factories import MineFactory
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.exploration_access import ExplorationAccess


class TestNOWApplication:
    def test_now_application(self, test_client):
        mine = MineFactory()
        now_application = NOWApplication(mine_guid=mine.mine_guid)
        exp_access = ExplorationAccess()
        exp_access.now_application = now_application

        db.session.add(mine)
        db.session.add(now_application)
        db.session.add(exp_access)
