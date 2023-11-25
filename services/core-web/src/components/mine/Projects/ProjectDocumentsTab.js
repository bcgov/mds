import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import {
  fetchProjectById,
  removeDocumentFromProjectSummary,
  removeDocumentFromInformationRequirementsTable,
  removeDocumentFromMajorMineApplication,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import customPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { Feature } from "@mds/common";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import * as Strings from "@mds/common/constants/strings";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  project: customPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  mineDocuments: PropTypes.arrayOf(customPropTypes.documentRecord),
  removeDocumentFromProjectSummary: PropTypes.func.isRequired,
  removeDocumentFromInformationRequirementsTable: PropTypes.func.isRequired,
  removeDocumentFromMajorMineApplication: PropTypes.func.isRequired,
};

export class ProjectDocumentsTab extends Component {
  state = {
    fixedTop: false,
    isLoaded: false,
  };

  allDocuments = [];

  componentDidMount() {
    this.handleFetchData().then(() => {
      this.setState({ isLoaded: true });
    });

    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  mergeAllDocuments = (documents) => {
    if (documents) {
      this.allDocuments.push(...documents);
    }
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleFetchData = async () => {
    const { projectGuid } = this.props.match?.params;
    const project = await this.props.fetchProjectById(projectGuid);

    this.props.fetchMineDocuments(project.mine_guid, {
      is_archived: true,
      project_guid: projectGuid,
    });
  };

  componentDidUpdate(nextProps) {
    if (
      nextProps.match.params.tab !== this.props.match.params.tab &&
      this.props.match.params.tab === "documents"
    ) {
      this.handleFetchData();
    }
  }

  handleDeleteDocument = (event, key, documentParent) => {
    event.preventDefault();
    const {
      project_guid: projectGuid,
      information_requirements_table,
      project_summary,
      major_mine_application,
    } = this.props.project;
    switch (documentParent) {
      case "project summary":
        return this.props
          .removeDocumentFromProjectSummary(projectGuid, project_summary?.project_summary_guid, key)
          .then(() => this.props.fetchProjectById(projectGuid));
      case "irt":
        return this.props
          .removeDocumentFromInformationRequirementsTable(
            projectGuid,
            information_requirements_table?.irt_guid,
            key
          )
          .then(() => this.props.fetchProjectById(projectGuid));
      case "major mine application":
        return this.props
          .removeDocumentFromMajorMineApplication(
            projectGuid,
            major_mine_application?.major_mine_application_guid,
            key
          )
          .then(() => this.props.fetchProjectById(projectGuid));
      default:
    }
  };

  renderDocumentSection = (
    sectionTitle,
    sectionHref,
    sectionDocuments,
    isApplicationFile = false
  ) => {
    const titleElement = isApplicationFile ? (
      <Typography.Text strong style={{ fontSize: "20px", textTransform: "uppercase" }}>
        {sectionTitle}
      </Typography.Text>
    ) : (
      <Typography.Title level={4}>{sectionTitle}</Typography.Title>
    );
    const formattedSectionHref = [
      "primary-documents",
      "spatial-components",
      "supporting-documents",
    ].includes(sectionHref)
      ? "major-mine-application"
      : sectionHref;
    let documentParent = null;
    const documentParents = {
      "project-description": "project summary",
      irt: "irt",
      "major-mine-application": "major mine application",
    };
    documentParent = documentParents?.[formattedSectionHref];

    return (
      <div id={sectionHref}>
        {titleElement}
        <DocumentTable
          documents={sectionDocuments.map((doc) => new MajorMineApplicationDocument(doc))}
          canArchiveDocuments={true}
          onArchivedDocuments={() => this.handleFetchData()}
          additionalColumnProps={[{ key: "name", colProps: { width: "80%" } }]}
          documentParent={documentParent}
          removeDocument={this.handleDeleteDocument}
          showVersionHistory={true}
          isLoaded={this.state.isLoaded}
          enableBulkActions={true}
        />
      </div>
    );
  };

  renderArchivedDocumentsSection = (archivedDocuments) => {
    return (
      <ArchivedDocumentsSection
        additionalColumns={[
          renderCategoryColumn("category_code", "Category", Strings.CATEGORY_CODE, true),
        ]}
        documents={
          archivedDocuments && archivedDocuments.length > 0
            ? archivedDocuments.map((doc) => new MajorMineApplicationDocument(doc))
            : []
        }
      />
    );
  };

  render() {
    return (
      <>
        <Row>
          <Col span={24}>
            <Typography.Title level={3}>All Project Documents</Typography.Title>
          </Col>
        </Row>
        <br />
        <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <ScrollSideMenu
            menuOptions={[
              { href: "project-description", title: "Project Description" },
              { href: "irt", title: "IRT" },
              { href: "major-mine-application", title: "Major Mine Application" },
              this.props.isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
                href: "archived-documents",
                title: "Archived Documents",
              },
            ].filter(Boolean)}
            featureUrlRoute={routes.PROJECT_ALL_DOCUMENTS.hashRoute}
            featureUrlRouteArguments={[this.props.match?.params?.projectGuid]}
          />
        </div>
        <div
          className={
            this.state.fixedTop ? "side-menu--content with-fixed-top top-125" : "side-menu--content"
          }
        >
          {this.renderDocumentSection(
            "Project Description",
            "project-description",
            this.props.project.project_summary?.documents || []
          )}
          <br />
          {this.renderDocumentSection(
            "IRT",
            "irt",
            this.props.project.information_requirements_table?.documents || []
          )}
          <br />
          <Typography.Title level={4} id="major-mine-application">
            Application Files
          </Typography.Title>
          {this.renderDocumentSection(
            "Primary Documents",
            "primary-documents",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "PRM"
            ) || [],
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Spatial Components",
            "spatial-components",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPT"
            ) || [],
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Supporting Documents",
            "supporting-documents",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPR"
            ) || [],
            true
          )}
          <br />
          {this.renderArchivedDocumentsSection(this.props.mineDocuments)}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  mineDocuments: getMineDocuments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectById,
      fetchMineDocuments,
      removeDocumentFromProjectSummary,
      removeDocumentFromInformationRequirementsTable,
      removeDocumentFromMajorMineApplication,
    },
    dispatch
  );

ProjectDocumentsTab.propTypes = propTypes;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withFeatureFlag(ProjectDocumentsTab))
);
