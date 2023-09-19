from app.api.activity.models.activity_notification import ActivityRecipients
from app.api.utils.feature_flag import is_feature_enabled, Feature
from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType
from flask import current_app

class ProjectUtil:

    def notifiy_file_updates(project, mine):
        if is_feature_enabled(Feature.MINE_APPLICATION_FILE_UDPATE_ALERTS):
            renotifiy_hours = 24
            message = f'File(s) in project {project.project_title} has been updated for mine {mine.mine_name}'
            trigger_notification(message, ActivityType.mine_project_documents_updated, mine, 'DocumentManagement', project.project_guid, None, None, ActivityRecipients.core_users, True, renotifiy_hours*60)
