import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@mds/common/redux/rootState";
import ScrollSidePageWrapper from "../common/ScrollSidePageWrapper";
import { ScrollSideMenuProps } from "../common/ScrollSideMenu";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import { Alert, Col, Row, Typography } from "antd";
import ProjectDocumentsTabSection from "./ProjectDocumentsTabSection";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ArchivedDocumentsSection from "./ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import { getSystemFlag, isProponent, userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import SpatialDocumentTable from "../documents/spatial/SpatialDocumentTable";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { MineDocument } from "@mds/common/models/documents/document";
import Loading from "../common/Loading";
import { getProjectSummaryDocumentTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { areDocumentFieldsDisabled } from "./projectUtils";
import { IProject, IProjectSummaryAuthorization } from "@mds/common/interfaces/projects";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { Feature } from "@mds/common/utils";
import { CATEGORY_CODE } from "@mds/common/constants/strings";
import { fetchAmsFinalAppsByProjectSummary, getAmsFinalAppsByProjectSummary } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { USER_ROLES } from "@mds/common/constants/environment";


interface ProjectDocumentsTabProps {
  project: IProject;
}
const ProjectDocumentsTab: FC<ProjectDocumentsTabProps> = ({ project }) => {
  const dispatch = useAppDispatch();
  const mineDocuments = useSelector(getMineDocuments);
  const projectSummaryDocumentTypesHash = useSelector(getProjectSummaryDocumentTypesHash);
  const amsApplications = useSelector(getAmsFinalAppsByProjectSummary(project?.project_summary?.project_summary_guid));
  const canEditMajorMineApplications = useSelector(userHasRole(USER_ROLES.role_edit_major_mine_applications));
  const isUserProponent = useSelector(isProponent);

  const { isFeatureEnabled } = useFeatureFlag();
  const isAmsDocumentsEnabled = isFeatureEnabled(Feature.AMS_FINAL_APPLICATION);
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const [isLoaded, setIsLoaded] = useState(true);
  const canManageAmsFiles = canEditMajorMineApplications || isUserProponent;

  const authsWithDocs =
    project?.project_summary?.authorizations?.filter(
      (auth) => auth.amendment_documents.length > 0
    ) ?? [];
  const appsWithDocs = amsApplications?.filter((app) =>
    app.documents.length > 0
  ) ?? [];
  const archivedAppDocs = appsWithDocs.reduce((acc, app) => {
    return [...acc, ...app.documents.filter((doc) => doc.is_archived)]
  }, []);

  const archivedDocs = [...mineDocuments, ...archivedAppDocs.map((d) => new MineDocument(d))];

  const refreshData = async () => {
    setIsLoaded(false);
    await Promise.all([
      dispatch(fetchProjectById(project.project_guid)),
      dispatch(
        fetchMineDocuments(project.mine_guid, {
          is_archived: true,
          project_guid: project.project_guid,
        })
      ),
    ]);
    setIsLoaded(true);
  };

  const refreshAmsApps = async () => {
    setIsLoaded(false);
    dispatch(
      fetchAmsFinalAppsByProjectSummary(project.project_summary.project_summary_guid)
    ).then(() => setIsLoaded(true));
    setIsLoaded(true);
  };

  useEffect(() => {
    dispatch(
      fetchMineDocuments(project.mine_guid, {
        is_archived: true,
        project_guid: project.project_guid,
      })
    );
  }, []);

  useEffect(() => {
    if (project?.project_summary?.project_summary_guid) {
      refreshAmsApps();
    }
  }, [project?.project_summary?.project_summary_guid]);


  const headerHeight = isCore ? 121 : 123;
  const tabNavHeight = isCore ? 60 : 49;
  const topOffset = headerHeight + tabNavHeight;

  const getAuthorizationHeader = (auth: IProjectSummaryAuthorization) => {
    const {
      project_summary_authorization_type,
      project_summary_permit_type,
      existing_permits_authorizations,
    } = auth;
    const permitNoString =
      project_summary_permit_type[0] === "AMENDMENT"
        ? `-amendment-(${existing_permits_authorizations[0]})`
        : "";
    return `${project_summary_authorization_type}${permitNoString}`
      .replace(/(_)/g, "-")
      .toLowerCase();
  };

  const canModifySummaryDocs = !areDocumentFieldsDisabled(systemFlag, project?.project_summary?.status_code);
  const canModifyMmaDocs = !areDocumentFieldsDisabled(systemFlag, project?.major_mine_application?.status_code);

  const projectSummaryDocs =
    project?.project_summary?.documents?.map(
      (d) =>
        new MineDocument({
          ...d,
          category: projectSummaryDocumentTypesHash[d.project_summary_document_type_code],
        })
    ) ?? [];

  const pdSpatialDocuments = projectSummaryDocs.filter(
    (doc) => doc.category === projectSummaryDocumentTypesHash.SPT
  );
  const pdSupportingDocuments = projectSummaryDocs.filter(
    (doc) => doc.category === projectSummaryDocumentTypesHash.SPR
  );

  const majorMineAppDocs =
    project?.major_mine_application?.documents?.map(
      (d) =>
        new MineDocument({
          ...d,
          category: CATEGORY_CODE[d.major_mine_application_document_type_code],
        })
    ) ?? [];

  const primaryDocuments = majorMineAppDocs.filter((doc) => doc.category === CATEGORY_CODE.PRM);
  const mmaSpatialDocuments = majorMineAppDocs.filter((doc) => doc.category === CATEGORY_CODE.SPT);
  const mmaSupportingDocuments = majorMineAppDocs.filter(
    (doc) => doc.category === CATEGORY_CODE.SPR
  );
  const ministryDecisionDocuments =
    project?.project_decision_package?.documents?.map(
      (d) =>
        new MineDocument({
          ...d,
          category: CATEGORY_CODE[d.project_decision_package_document_type_code],
        })
    ) ?? [];
  const irtDocuments =
    project?.information_requirements_table?.documents?.map(
      (d) =>
        new MineDocument({
          ...d,
          category: CATEGORY_CODE[d.information_requirements_table_document_type_code],
        })
    ) ?? [];

  const spatialCategoryText = "Spatial Files";

  const amsSections = isAmsDocumentsEnabled ? appsWithDocs.map((application) => {
    const auth = project?.project_summary?.authorizations?.find((a) => a.project_summary_authorization_guid === application.project_summary_authorization_guid);
    const titleText = `Application (#${auth.ams_tracking_number})`;
    const headingText = getAuthorizationHeader(auth);
    const infoText = formatUrlToUpperCaseString(headingText);
    const href = `application-${auth.ams_tracking_number}`;

    return {
      href,
      title: <div className="sub-tab-2">{titleText}</div>,
      content: (
        <ProjectDocumentsTabSection
          id={application.ams_final_application_guid}
          title={titleText}
          titleLevel={5}
          infoText={infoText}
          key={application.ams_final_application_guid}
          canArchive={canManageAmsFiles}
          canReplace={canManageAmsFiles}
          onArchivedDocuments={refreshAmsApps}
          documents={application.documents.map(
            (d) =>
              new MineDocument({
                ...d,
                category: d.document_type_description,
              })
          )}
        />
      ),
    }
  }) : [];

  const sections: any[] = [
    {
      href: "project-description",
      content: (
        <>
          <Typography.Title level={3}>Project Description</Typography.Title>
          <Alert
            className={isCore ? "ant-alert-grey" : ""}
            description="Below are the required and supporting documents for each authorization submitted in the Project Description. 
            Refer to the Project Description Purpose and Authorization sections for the complete list of required documents."
            showIcon
          />
        </>
      ),
    },
    ...authsWithDocs.map((auth) => {
      const headingText = getAuthorizationHeader(auth);
      const titleText = formatUrlToUpperCaseString(headingText);
      const href = headingText.replace("(", "").replace(")", "");

      return {
        href,
        title: <div className="sub-tab-1">{titleText}</div>,
        content: (
          <ProjectDocumentsTabSection
            id={href}
            title={titleText}
            key={auth.project_summary_authorization_guid}
            canArchive={false}
            canReplace={canModifySummaryDocs}
            documents={auth.amendment_documents.map(
              (d) =>
                new MineDocument({
                  ...d,
                  category: projectSummaryDocumentTypesHash[d.project_summary_document_type_code],
                })
            )}
          />
        ),
      };
    }),
    {
      href: "pd-spatial-components",
      title: <div className="sub-tab-1">Spatial Components</div>,
      content: (
        <>
          <Typography.Title level={4}>Spatial Components</Typography.Title>
          <SpatialDocumentTable documents={pdSpatialDocuments} categoryText={spatialCategoryText} />
        </>
      ),
    },
    {
      href: "pd-supporting-documents",
      title: <div className="sub-tab-1">Supporting Documents</div>,
      content: (
        <ProjectDocumentsTabSection
          id="pd-supporting-documents"
          title="Supporting Documents"
          documents={pdSupportingDocuments}
          onArchivedDocuments={refreshData}
          canReplace={canModifySummaryDocs}
          canArchive={canModifySummaryDocs}
        />
      ),
    },
    {
      href: "information-requirements-table",
      content: (
        <ProjectDocumentsTabSection
          id="information-requirements-table"
          key="information-requirements-table"
          titleLevel={3}
          documents={irtDocuments}
          canReplace={false}
          canArchive={false}
          infoText="Here is the IRT file you submitted under the Information Requirements Table.
          To make changes to the submission, return to the IRT tab."
        />
      ),
    },
    {
      href: "application",
      content: (
        <>
          <Typography.Title level={3}>Application</Typography.Title>
          <Typography.Paragraph>Below are the documents submitted as part of the Major Mine Application.</Typography.Paragraph>
        </>
      )
    },
    {
      href: "mines-act",
      title: <div className="sub-tab-1">Mines Act</div>,
      content: (
        <Typography.Title level={4}>Mines Act</Typography.Title>
      )
    },
    {
      href: "mma-primary-document",
      title: <div className="sub-tab-2">Primary Document</div>,
      content: (
        <ProjectDocumentsTabSection
          id="primary-document"
          key="primary-document"
          onArchivedDocuments={refreshData}
          titleLevel={5}
          documents={primaryDocuments}
          canReplace={canModifyMmaDocs}
          canArchive={canModifyMmaDocs}
        />
      ),
    },
    {
      href: "mma-spatial-components",
      title: <div className="sub-tab-2">Spatial Components</div>,
      content: (
        <>
          <Typography.Title level={5}>Spatial Components</Typography.Title>
          <SpatialDocumentTable
            documents={mmaSpatialDocuments}
            categoryText={spatialCategoryText}
          />
        </>
      ),
    },
    {
      href: "mma-supporting-documents",
      title: <div className="sub-tab-2">Supporting Documents</div>,
      content: (
        <ProjectDocumentsTabSection
          id="supporting-documents"
          key="supporting-documents"
          onArchivedDocuments={refreshData}
          titleLevel={5}
          documents={mmaSupportingDocuments}
          canReplace={canModifyMmaDocs}
          canArchive={canModifyMmaDocs}
        />
      ),
    },
    amsSections.length > 1 && isAmsDocumentsEnabled && {
      href: "ENV Applications",
      title: <div className="sub-tab-1">ENV Applications</div>,
      content: (
        <>
          <Typography.Title level={4}>ENV Applications</Typography.Title>
          <Alert
            className={isCore ? "ant-alert-grey" : ""}
            description="Some informative text for ENV Applications"
            showIcon
          />
        </>
      ),
    },
    ...amsSections,
    isCore && {
      href: "ministry-decision-documentation",
      content: (
        <ProjectDocumentsTabSection
          id="ministry-decision-documentation"
          key="ministry-decision-documentation"
          onArchivedDocuments={refreshData}
          documents={ministryDecisionDocuments}
          canReplace={canModifyMmaDocs}
          canArchive={canModifyMmaDocs}
        />
      ),
    },
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
      href: "archived-documents",
      content: (
        <ArchivedDocumentsSection
          documents={archivedDocs}
          showCategory={false}
        />
      ),
    },
  ].filter(Boolean);

  const menuOptions = sections.map((t) => {
    return { href: t.href, title: t?.title ?? formatUrlToUpperCaseString(t.href) };
  });
  const sideBarRoute = {
    url: GLOBAL_ROUTES?.EDIT_PROJECT,
    params: [project.project_guid, "documents"],
  };
  const scrollSideMenuProps: ScrollSideMenuProps = {
    menuOptions,
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };

  return isLoaded ? (
    <ScrollSidePageWrapper
      header={null}
      headerHeight={topOffset}
      menuProps={scrollSideMenuProps}
      content={
        <Row gutter={[16, 16]}>
          {sections.map((section) => {
            if (!section.content) {
              const title = section?.title ?? formatUrlToUpperCaseString(section.href);
              return (
                <Col span={24} key={section.href}>
                  <Typography.Title level={3} id={section.href}>
                    {title}
                  </Typography.Title>
                </Col>
              );
            }
            return (
              <Col id={section.href} key={section.href} span={24}>
                {section.content}
              </Col>
            );
          })}
        </Row>
      }
    />
  ) : (
    <Loading />
  );
};

export default ProjectDocumentsTab;
