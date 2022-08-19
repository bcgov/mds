import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { getProject } from "@common/selectors/projectSelectors";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import customPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ProjectDocumentsTabSideMenu from "./ProjectDocumentsTabSideMenu";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  project: customPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
};

export class ProjectDocumentsTab extends Component {
  state = {
    fixedTop: false,
  };

  componentDidMount() {
    this.handleFetchData();
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

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

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;
    return this.props.fetchProjectById(projectGuid);
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

    return (
      <div id={sectionHref}>
        {titleElement}
        <DocumentTable
          documents={sectionDocuments.reduce(
            (docs, doc) => [
              {
                key: doc.mine_document_guid,
                mine_document_guid: doc.mine_document_guid,
                document_manager_guid: doc.document_manager_guid,
                name: doc.document_name,
                category: null,
                uploaded: doc.upload_date,
              },
              ...docs,
            ],
            []
          )}
          excludedColumnKeys={["dated", "category"]}
          additionalColumnProps={[{ key: "name", colProps: { width: "80%" } }]}
        />
      </div>
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
          <ProjectDocumentsTabSideMenu />
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
            this.props.project.major_mine_application?.documents.filter(
              (doc) => doc.major_mine_application_document_type_code === "PRM"
            ),
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Spatial Components",
            "spatial-components",
            this.props.project.major_mine_application?.documents.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPT"
            ),
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Supporting Documents",
            "supporting-documents",
            this.props.project.major_mine_application?.documents.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPR"
            ),
            true
          )}
        </div>
      </>
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

ProjectDocumentsTab.propTypes = propTypes;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectDocumentsTab));
