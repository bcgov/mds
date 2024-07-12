import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollSidePageWrapper from "../common/ScrollSidePageWrapper";
import { ScrollSideMenuProps } from "../common/ScrollSideMenu";
import { useParams } from "react-router-dom";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import { Feature, IProject, IProjectSummaryAuthorization } from "../..";
import { Col, Row } from "antd";
import ProjectDocumentsTabSection from "./ProjectDocumentsTabSection";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ArchivedDocumentsSection from "./ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";

interface ProjectDocumentsTabProps {
  project: IProject;
  refreshData: () => Promise<void>;
}
const ProjectDocumentsTab: FC<ProjectDocumentsTabProps> = ({ project, refreshData }) => {
  const mineDocuments = useSelector(getMineDocuments);
  const { isFeatureEnabled } = useFeatureFlag();

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
    return `${project_summary_authorization_type}${permitNoString}`
      .replace(/(_)/g, "-")
      .toLowerCase();
  };

  const tabs = [
    "project-description",
    "information-requirements-table",
    "major-mine-application",
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && "archived-documents",
  ].filter(Boolean);
  return (
    <>
      {authsWithDocs.map((auth) => (
        <ProjectDocumentsTabSection
          id={getAuthorizationHeader(auth)}
          key={auth.project_summary_authorization_guid}
          onArchivedDocuments={refreshData}
          documents={auth.amendment_documents}
        />
      ))}
      <ProjectDocumentsTabSection
        id="information-requirements-table"
        key="information-requirements-table"
        onArchivedDocuments={refreshData}
        documents={project.information_requirements_table.documents}
      />
      <ProjectDocumentsTabSection
        id="major-mine-application"
        key="major-mine-application"
        onArchivedDocuments={refreshData}
        // @ts-ignore
        documents={project.major_mine_application.documents}
      />
      <ArchivedDocumentsSection documents={mineDocuments} />
    </>
  );
};

export default ProjectDocumentsTab;
