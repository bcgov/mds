import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Tabs, Typography } from "antd";
import PropTypes from "prop-types";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { getProject } from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import customPropTypes from "@/customPropTypes";
import DocumentsPage from "./DocumentsPage";
import { getMineDocuments } from "@common/selectors/mineSelectors";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import { Feature } from "@mds/common";
import { MajorMineApplicationDocument } from "@common/models/documents/document";
import { renderCategoryColumn } from "@/components/common/CoreTableCommonColumns";
import * as Strings from "@common/constants/strings";
import withFeatureFlag from "@common/providers/featureFlags/withFeatureFlag";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  project: customPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  isFeatureEnabled: PropTypes.func.isFeatureEnabled,
  refreshData: PropTypes.func.isRequired,
  mineDocuments: PropTypes.arrayOf(customPropTypes.mineDocument),
};

export class DocumentsTab extends Component {
  state = {
    activeTab: "project-description",
  };

  allDocuments = [];

  componentDidMount() {
    this.handleFetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { project } = nextProps;
    this.allDocuments = [
      project?.project_summary?.documents,
      project?.information_requirements_table?.documents,
      project?.major_mine_application?.documents,
    ];
  }

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;
    return this.props.fetchProjectById(projectGuid);
  };

  handleTabChange = (activeTab) => {
    const { projectGuid } = this.props.match.params;
    const url = `/projects/${projectGuid}/documents/#${activeTab}`;
    this.props.history.push({ pathname: url });

    const a = document.createElement("a");
    a.href = url;
    a.click();
    a.remove();
  };

  render() {
    const tabs = [
      "project-description",
      "information-requirements-table",
      "major-mine-application",
      this.props.isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && "archived-documents",
    ].filter(Boolean);

    const documentColumns = [documentNameColumn(), uploadDateColumn()];
    const renderAllDocuments = (docs) => (
      <Row>
        <Col span={24}>
          <div id="project-description">
            <DocumentsPage
              onArchivedDocuments={this.props.refreshData}
              title={formatUrlToUpperCaseString(tabs[0])}
              documents={docs[0]}
            />
          </div>
          <div id="information-requirements-table">
            <DocumentsPage
              onArchivedDocuments={this.props.refreshData}
              title={formatUrlToUpperCaseString(tabs[1])}
              documents={docs[1]}
            />
          </div>
          <div id="major-mine-application">
            <DocumentsPage
              onArchivedDocuments={this.props.refreshData}
              title={formatUrlToUpperCaseString(tabs[2])}
              documents={docs[2]}
            />
          </div>

          <ArchivedDocumentsSection
            titleLevel={3}
            additionalColumns={[
              renderCategoryColumn("category_code", "Category", Strings.CATEGORY_CODE, true),
            ]}
            documentColumns={documentColumns}
            documents={
              this.props.mineDocuments && this.props.mineDocuments.length > 0
                ? this.props.mineDocuments.map((doc) => new MajorMineApplicationDocument(doc))
                : []
            }
          />
        </Col>
      </Row>
    );

    return (
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Title level={2}>All Project Documents</Typography.Title>
        </Col>
        <Col span={24}>
          <Tabs
            tabPosition="left"
            activeKey={this.state.activeTab}
            defaultActiveKey={tabs[0]}
            onChange={(tab) => this.handleTabChange(tab)}
            className="vertical-tabs"
          >
            {tabs.map((tab) => {
              return (
                <Tabs.TabPane
                  tab={formatUrlToUpperCaseString(tab)}
                  key={tab}
                  className="vertical-tabs--tabpane"
                >
                  {renderAllDocuments(this.allDocuments)}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Col>
      </Row>
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
    },
    dispatch
  );

DocumentsTab.propTypes = propTypes;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withFeatureFlag(DocumentsTab))
);
