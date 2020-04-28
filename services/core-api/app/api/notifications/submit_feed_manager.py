from feed_managers.base import Manager


class SubmissionFeedManager(Manager):
    feed_classes = dict(normal=SubmissionFeed)
    user_feed_class = UserSubmissionFeed

    def add_submission(self, submission):
        activity = submission.create_activity()
        # add user activity adds it to the user feed, and starts the fanout
        self.add_user_activity(pin.user_id, activity)

    def get_user_follower_ids(self, user_id):
        ids = Follow.objects.filter(target=user_id).values_list('user_id', flat=True)
        return {FanoutPriority.HIGH: ids}
