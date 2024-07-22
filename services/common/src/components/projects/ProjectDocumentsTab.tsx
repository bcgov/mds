import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollSidePageWrapper from "../common/ScrollSidePageWrapper";
import ScrollSideMenu, { ScrollSideMenuProps } from "../common/ScrollSideMenu";
import { useParams } from "react-router-dom";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import { Feature, IProject, IProjectSummaryAuthorization, SystemFlagEnum } from "../..";
import { Col, Row, Typography } from "antd";
import ProjectDocumentsTabSection from "./ProjectDocumentsTabSection";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ArchivedDocumentsSection from "./ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import SpatialDocumentTable from "../documents/spatial/SpatialDocumentTable";

interface ProjectDocumentsTabProps {
  project: IProject;
  refreshData: () => Promise<void>;
}
const ProjectDocumentsTab: FC<ProjectDocumentsTabProps> = ({ project, refreshData }) => {
  const mineDocuments = useSelector(getMineDocuments);
  const { isFeatureEnabled } = useFeatureFlag();
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;

  const authsWithDocs = project.project_summary.authorizations.filter(
    (auth) => auth.amendment_documents.length > 0
  );

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
    const res = `${project_summary_authorization_type}${permitNoString}`
      .replace(/(_)/g, "-")
      .toLowerCase();
    console.log(auth, res);
    return res;
  };

  const tabs = [
    "project-description",
    "information-requirements-table",
    "primary-document",
    "spatial-components",
    "supporting-documents",
    // "major-mine-application",
    isCore && "ministry-decision-documentation",
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && "archived-documents",
  ].filter(Boolean);

  const primaryDocuments = project.major_mine_application.documents.filter(
    (doc) => doc.major_mine_application_document_type_code === "PRM"
  );
  const spatialDocuments = project.major_mine_application.documents.filter(
    (doc) => doc.major_mine_application_document_type_code === "SPT"
  );
  const supportingDocuments = project.major_mine_application.documents.filter(
    (doc) => doc.major_mine_application_document_type_code === "SPR"
  );

  // const getTabs = () => {

  const tabsTest2: any[] = [
    { href: "project-description" },
    ...authsWithDocs.map((auth) => {
      const href = getAuthorizationHeader(auth);
      return {
        href,
        title: <div className="sub-tab-1">{formatUrlToUpperCaseString(href)}</div>,
        content: (
          <ProjectDocumentsTabSection
            id={href}
            key={auth.project_summary_authorization_guid}
            onArchivedDocuments={refreshData}
            documents={auth.amendment_documents}
          />
        ),
      };
    }),
    {
      href: "pd-spatial-components",
      title: <div className="sub-tab-1">Spatial Components</div>,
      content: (
        <>
          <Typography.Title level={3}>Spatial Components</Typography.Title>
          <SpatialDocumentTable documents={[]} />
        </>
      ),
    },
    {
      href: "pd-supporting-documents",
      title: <div className="sub-tab-1">Supporting Documents</div>,
      content: (
        <ProjectDocumentsTabSection
          id="pd-supporting-documents"
          documents={[]}
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
          documents={project.information_requirements_table.documents}
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
        <ProjectDocumentsTabSection
          id="spatial-components"
          key="spatial-components"
          onArchivedDocuments={refreshData}
          documents={spatialDocuments}
        />
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
          documents={supportingDocuments}
        />
      ),
    },
    isCore && { href: "ministry-decision-documentation" },
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
      href: "archived-documents",
      content: <ArchivedDocumentsSection documents={mineDocuments} />,
    },
  ].filter(Boolean);
  // };

  const menuOptions = tabs.map((t) => {
    return { href: t, title: formatUrlToUpperCaseString(t) };
  });
  const menuOptions2 = tabsTest2.map((t) => {
    return { href: t.href, title: t?.title ?? formatUrlToUpperCaseString(t.href) };
  });
  const sideBarRoute = {
    url: GLOBAL_ROUTES?.EDIT_PROJECT,
    params: [project.project_guid, "documents"],
  };
  const scrollSideMenuProps: ScrollSideMenuProps = {
    // menuOptions,
    menuOptions: menuOptions2,
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };
  return (
    <>
      {/* <> */}
      {/* <ScrollSideMenu
        menuOptions={menuOptions}
        featureUrlRoute={sideBarRoute.url.hashRoute}
        featureUrlRouteArguments={sideBarRoute.params}
      /> */}
      <ScrollSidePageWrapper
        header={null}
        headerHeight={225}
        menuProps={scrollSideMenuProps}
        content={
          <>
            {tabsTest2.map((tab) => {
              if (!tab.content) {
                const title = tab?.title ?? formatUrlToUpperCaseString(tab.href);
                return (
                  <Typography.Title level={2} id={tab.href} key={tab.href}>
                    {title}
                  </Typography.Title>
                );
              }
              return (
                <div id={tab.href} key={tab.href}>
                  {tab.content}
                </div>
              );
            })}
            {/* <div id="project-description">
          {authsWithDocs.map((auth) => (
            <ProjectDocumentsTabSection
              id={getAuthorizationHeader(auth)}
              key={auth.project_summary_authorization_guid}
              onArchivedDocuments={refreshData}
              documents={auth.amendment_documents}
            />
          ))}
        </div>
          <ProjectDocumentsTabSection
            id="information-requirements-table"
            key="information-requirements-table"
            onArchivedDocuments={refreshData}
            documents={project.information_requirements_table.documents}
          />
          <ProjectDocumentsTabSection
            id="primary-document"
            key="primary-document"
            onArchivedDocuments={refreshData}
            documents={primaryDocuments}
          />
          <ProjectDocumentsTabSection
            id="spatial-components"
            key="spatial-components"
            onArchivedDocuments={refreshData}
            documents={spatialDocuments}
          />
          <ProjectDocumentsTabSection
            id="supporting-documents"
            key="supporting-documents"
            onArchivedDocuments={refreshData}
            documents={supportingDocuments}
          />

          <ArchivedDocumentsSection documents={mineDocuments} /> */}
          </>
        }
      />
    </>
  );
};

export default ProjectDocumentsTab;
