import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Tabs, Typography } from "antd";
import PropTypes from "prop-types";
import customPropTypes from "@/customPropTypes";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { getProject } from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import DocumentsPage from "./DocumentsPage";

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
};

const tabs = ["project-description", "information-requirements-table", "major-mine-application"];

export class DocumentsTab extends Component {
  state = {
    activeTab: tabs[0],
  };

  allDocuments = [];

  componentDidMount() {
    this.handleFetchData();
    this.allDocuments.push(this.props.project?.project_summary?.documents);
    this.allDocuments.push(this.props.project?.information_requirements_table?.documents);
    this.allDocuments.push(this.props.project?.major_mine_application?.documents);
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
    const renderAllDocuments = (docs) => (
      <Row>
        <Col span={24}>
          <div id="project-description">
            <DocumentsPage title={formatUrlToUpperCaseString(tabs[0])} documents={docs[0]} />
          </div>
          <div id="information-requirements-table">
            <DocumentsPage title={formatUrlToUpperCaseString(tabs[1])} documents={docs[1]} />
          </div>
          <div id="major-mine-application">
            <DocumentsPage title={formatUrlToUpperCaseString(tabs[2])} documents={docs[2]} />
          </div>
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectById,
    },
    dispatch
  );

DocumentsTab.propTypes = propTypes;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DocumentsTab));
