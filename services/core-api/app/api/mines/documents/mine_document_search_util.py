from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.mines.documents.models.mine_document import MineDocument
from app.extensions import db, api


class MineDocumentSearchUtil():
    @classmethod
    def filter_by(cls, mine_guid, project_guid=None, project_summary_guid=None, project_decision_package_guid=None, irt_id=None, is_archived=False):
        qy = db.session.query(MineDocument).filter_by(mine_guid=mine_guid)

        if project_guid is not None:
            qy = qy.filter_by(project_guid=project_guid)

        if is_archived is not None:
            qy = qy.filter_by(is_archived=is_archived)

        if project_summary_guid is not None:
            qy = qy.join(ProjectSummaryDocumentXref)\
                .join(ProjectSummary)\
                .filter(ProjectSummary.project_summary_guid == project_summary_guid)

        return qy.all()
