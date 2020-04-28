
from submit_feed_manager import SubmitFeedManager
 
def testnotify():
    
    manager = SubmitFeedManager()
    feed = manager.get_feeds("request.user.id")['normal']
    activities = list(feed[:25])
    print(activities)