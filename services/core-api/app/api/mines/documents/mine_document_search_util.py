from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.projects.major_mine_application.models.major_mine_application_document_xref import MajorMineApplicationDocumentXref
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage
from app.api.projects.project_decision_package.models.project_decision_package_document_xref import ProjectDecisionPackageDocumentXref
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project.models.project import Project
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.information_requirements_table.models.information_requirements_table_document_xref import InformationRequirementsTableDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from sqlalchemy import desc, or_
from app.extensions import db, api
from sqlalchemy.orm import aliased


class MineDocumentSearchUtil():
    """
    Utility functions for searching mine documents.
    This is split out from the MineDocument itself as to prevent circular dependencies
    """
    @classmethod
    def filter_by(cls, mine_guid, project_guid=None, major_mine_application_guid=None, project_summary_guid=None, project_decision_package_guid=None, irt_id=None, is_archived=False):
        """
        Find Mine Documents by the given project related params
        Returns a list of MineDocuments
        """
        qy = db.session.query(MineDocument).filter_by(mine_guid=mine_guid, deleted_ind=False)

        if is_archived is not None:
            qy = qy.filter_by(is_archived=is_archived)

        if project_guid is not None:
            # A Project consists of the following loosely related entities (hence the many joins)
            # - Major Mine Applications
            # - Project Summary
            # - Project Decision Package
            # - Information Requirements Table
            qy.join(MajorMineApplicationDocumentXref)\
                .join(MajorMineApplication)\
                .join(ProjectSummaryDocumentXref)\
                .join(ProjectSummary)\
                .join(ProjectDecisionPackageDocumentXref)\
                .join(ProjectDecisionPackage)\
                .join(InformationRequirementsTableDocumentXref)\
                .join(InformationRequirementsTable)\
                .filter(or_(
                    MajorMineApplication.project_guid == project_guid,
                    ProjectSummary.project_guid == project_guid,
                    ProjectDecisionPackage.project_guid == project_guid,
                    InformationRequirementsTable.project_guid == project_guid,
                ))

        if major_mine_application_guid is not None:
            qy = qy.join(MajorMineApplicationDocumentXref)\
                .join(MajorMineApplication)\
                .filter(MajorMineApplication.major_mine_application_guid == major_mine_application_guid)

        if project_summary_guid is not None:
            qy = qy.join(ProjectSummaryDocumentXref)\
                .join(ProjectSummary)\
                .filter(ProjectSummary.project_summary_guid == project_summary_guid)

        if project_decision_package_guid is not None:
            qy = qy.join(ProjectDecisionPackageDocumentXref)\
                .join(ProjectDecisionPackage)\
                .filter(ProjectDecisionPackage.project_decision_package_guid == project_decision_package_guid)

        return qy.all()

    @classmethod
    def find_by_document_name_and_project_guid(cls, document_name, project_guid=None):
        """
        Find Mine Documents by the document_name and the project_guid.
        """
        qy = db.session.query(MineDocument).filter_by(document_name=document_name, deleted_ind=False)
        
        if project_guid is not None:
            qy = qy\
                .join(ProjectSummaryDocumentXref)\
                .join(ProjectSummary)\
                .join(Project)\
                .filter(Project.project_guid == project_guid)\
                .order_by(desc(MineDocument.update_timestamp))
            
            return qy.first()
        
        raise ValueError("Missing 'project_guid', This is required to continue the file upload process.")