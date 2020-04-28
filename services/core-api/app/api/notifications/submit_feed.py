from stream_framework.feeds.redis import RedisFeed


class UserSubmitFeed(SubmitFeed):
    key_format = 'feed:user:%(user_id)s'


class SubmitFeed(RedisFeed):
    key_format = 'feed:normal:%(user_id)s'