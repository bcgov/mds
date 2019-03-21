from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.notification import Notification

class MineNotificationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def get(self, mine_guid=None):
        if mine_guid:
            #TODO Return all users subscribed to a given mine
            try:
                subscribers = Notification.find_notifications_by_mine_guid(mine_guid)
            except:
                return self.create_error_payload(422, 'Invalid Mine guid'), 422

        else:
            ##TODO Return all mines from a given subscriber
            mines = Notification.find_notifications_by_idir()

    # @api.doc(params={'mine_guid': 'Mine guid.'})
    # @requires_role_mine_view
    # def post(self, mine_guid=None):
    #
    #     if mine_status_guid:
    #         try:
    #     # TODO Add a mine to favorites
    #
    #     else:
    #         ##TODO Throw an error mine guid needed

    # @api.doc(params={'mine_guid': 'Mine guid.'})
    # @requires_role_mine_view
    # def delete(self, mine_guid=None):
    #
    #     if mine_status_guid:
    #         try:
    #     # TODO Delete the row from the db with that idir and guid
    #
    #     else:
    #         ##TODO Throw an error mine guid needed