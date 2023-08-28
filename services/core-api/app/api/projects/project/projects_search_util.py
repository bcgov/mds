
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project.models.project import Project

from app.extensions import db

class ProjectsSearchUtil():
    """
    Utility functions for searching projects.
    This is split out from the Project itself as to prevent circular dependencies
    """
    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        """
        Find Project by the mine_document_guid.
        """

        qy = db.session.query(Project)

        if mine_document_guid is not None:

            prjquery = qy\
                .select_from(ProjectSummaryDocumentXref)\
                .join(ProjectSummary, ProjectSummary.project_summary_id == ProjectSummaryDocumentXref.project_summary_id)\
                .join(Project, Project.project_guid == ProjectSummary.project_guid)\
                .join(MineDocument, MineDocument.mine_guid == ProjectSummary.mine_guid)\
                .filter(MineDocument.mine_document_guid == mine_document_guid)
            return prjquery.first()

        raise ValueError("Missing 'mine_document_guid'")
