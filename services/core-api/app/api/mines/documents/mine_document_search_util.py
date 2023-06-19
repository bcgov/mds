from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.projects.major_mine_application.models.major_mine_application_document_xref import MajorMineApplicationDocumentXref
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage
from app.api.projects.project_decision_package.models.project_decision_package_document_xref import ProjectDecisionPackageDocumentXref
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.information_requirements_table.models.information_requirements_table_document_xref import InformationRequirementsTableDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from sqlalchemy import or_
from app.extensions import db, api


class MineDocumentSearchUtil():
    @classmethod
    def filter_by(cls, mine_guid, project_guid=None, major_mine_application_guid=None, project_summary_guid=None, project_decision_package_guid=None, irt_id=None, is_archived=False):
        qy = db.session.query(MineDocument).filter_by(mine_guid=mine_guid)

        if is_archived is not None:
            qy = qy.filter_by(is_archived=is_archived)

        if project_guid is not None:
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
