from base import Activity

def create_activity(submission):
    activity = Activity(
        submission.user_id,
        SubmissionVerb,
        submission.id,
        submission.influencer_id,
        # time=make_naive(pin.created_at, pytz.utc),
        # extra_context=dict(item_id=pin.item_id)
    )
    return activity