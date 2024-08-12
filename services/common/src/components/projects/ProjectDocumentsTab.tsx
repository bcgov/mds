import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollSidePageWrapper from "../common/ScrollSidePageWrapper";
import { ScrollSideMenuProps } from "../common/ScrollSideMenu";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import {
  CATEGORY_CODE,
  Feature,
  IProject,
  IProjectSummaryAuthorization,
  SystemFlagEnum,
} from "../..";
import { Alert, Col, Row, Typography } from "antd";
import ProjectDocumentsTabSection from "./ProjectDocumentsTabSection";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ArchivedDocumentsSection from "./ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import SpatialDocumentTable from "../documents/spatial/SpatialDocumentTable";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { MineDocument } from "@mds/common/models/documents/document";
import Loading from "../common/Loading";
import { getProjectSummaryDocumentTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";

interface ProjectDocumentsTabProps {
  project: IProject;
}
const ProjectDocumentsTab: FC<ProjectDocumentsTabProps> = ({ project }) => {
  const dispatch = useDispatch();
  const mineDocuments = useSelector(getMineDocuments);
  const projectSummaryDocumentTypesHash = useSelector(getProjectSummaryDocumentTypesHash);

  const { isFeatureEnabled } = useFeatureFlag();
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const [isLoaded, setIsLoaded] = useState(true);

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

  useEffect(() => {
    dispatch(
      fetchMineDocuments(project.mine_guid, {
        is_archived: true,
        project_guid: project.project_guid,
      })
    );
  }, []);

  const authsWithDocs = project.project_summary.authorizations.filter(
    (auth) => auth.amendment_documents.length > 0
  );
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

  const projectSummaryDocs =
    project?.project_summary?.documents.map(
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
    project?.major_mine_application?.documents.map(
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
  const sections: any[] = [
    {
      href: "project-description",
      content: (
        <>
          <Typography.Title level={3}>Project Description</Typography.Title>
          <Alert
            className={isCore ? "ant-alert-grey" : ""}
            description="Refer back to Project Description Purpose and Authorization to see required document list."
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
            onArchivedDocuments={refreshData}
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
        />
      ),
    },
    {
      href: "information-requirements-table",
      content: (
        <ProjectDocumentsTabSection
          id="information-requirements-table"
          key="information-requirements-table"
          onArchivedDocuments={refreshData}
          documents={irtDocuments}
        />
      ),
    },
    { href: "major-mine-application" },
    {
      href: "mma-primary-document",
      title: <div className="sub-tab-1">Primary Document</div>,
      content: (
        <ProjectDocumentsTabSection
          id="primary-document"
          key="primary-document"
          onArchivedDocuments={refreshData}
          documents={primaryDocuments}
        />
      ),
    },
    {
      href: "mma-spatial-components",
      title: <div className="sub-tab-1">Spatial Components</div>,
      content: (
        <>
          <Typography.Title level={4}>Spatial Components</Typography.Title>
          <SpatialDocumentTable
            documents={mmaSpatialDocuments}
            categoryText={spatialCategoryText}
          />
        </>
      ),
    },
    {
      href: "mma-supporting-documents",
      title: <div className="sub-tab-1">Supporting Documents</div>,
      content: (
        <ProjectDocumentsTabSection
          id="supporting-documents"
          key="supporting-documents"
          onArchivedDocuments={refreshData}
          documents={mmaSupportingDocuments}
        />
      ),
    },
    isCore && {
      href: "ministry-decision-documentation",
      content: (
        <ProjectDocumentsTabSection
          id="ministry-decision-documentation"
          key="ministry-decision-documentation"
          onArchivedDocuments={refreshData}
          documents={ministryDecisionDocuments}
        />
      ),
    },
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
      href: "archived-documents",
      content: <ArchivedDocumentsSection documents={mineDocuments} showCategory={false} />,
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
