// TODO: Line 106 - Replace <Alert /> with a dynamic one that updates based on status code

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { Field, reduxForm } from "redux-form";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Button, Alert } from "antd";
import { Form } from "@ant-design/compatible";
import { LockOutlined, FolderViewOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProject } from "@common/selectors/projectSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchProjectById,
  createProjectDecisionPackage,
} from "@common/actionCreators/projectActionCreator";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as routes from "@/constants/routes";
import * as FORM from "@/constants/forms";
import customPropTypes from "@/customPropTypes";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import DocumentTable from "@/components/common/DocumentTable";
import { renderConfig } from "@/components/common/config";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  project: customPropTypes.project.isRequired,
  createProjectDecisionPackage: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class DecisionPackageTab extends Component {
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

  renderDocumentSection = (sectionTitle, sectionHref, sectionText, sectionDocuments) => {
    const titleElement = (
      <Typography.Text strong style={{ fontSize: "1.5rem" }}>
        {sectionTitle}
      </Typography.Text>
    );

    return (
      <div id={sectionHref}>
        <p>{titleElement}</p>
        <br />
        <p>{sectionText}</p>
        <DocumentTable
          documents={sectionDocuments?.reduce(
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
        />
      </div>
    );
  };

  handleOpenModal = (modalType) => {
    let title;
    let contentTitle;
    let content;
    let instructions;
    const submitHandler = this.handleUploadDocument;
    if (modalType === "decision-package") {
      title = "Upload Documents";
      instructions =
        "Please upload all relevant decision documentation below. You can add this set of files directly to your decision package by selecting the option below.";
      content = modalConfig.UPLOAD_PROJECT_PERMIT_PACKAGE_DOCUMENT_MODAL;
      contentTitle = "Upload Documents";
    } else if (modalType === "internal") {
      title = "Upload Internal Documents";
      instructions =
        "Upload internal documents that are created durring the review process. These files are for internal staff only and will not be shown to proponents.";
      content = modalConfig.UPLOAD_PROJECT_PERMIT_PACKAGE_DOCUMENT_MODAL;
      contentTitle = "Upload Internal Ministry Document";
    }

    return this.props.openModal({
      props: {
        title,
        contentTitle,
        instructions,
        projectGuid: this.props.project?.project_guid,
        modalType,
        closeModal: this.props.closeModal,
        handleSubmit: submitHandler,
        afterClose: () => {},
      },
      content,
    });
  };

  handleUploadDocument = (event, values) => {
    event.preventDefault();
    if (!this.props.project?.project_decision_package?.project_decision_package_guid) {
      const payload = {
        status_code: "INP",
        documents: values,
      };
      return this.props
        .createProjectDecisionPackage(
          {
            projectGuid: this.props.project?.project_guid,
          },
          payload
        )
        .then(() => this.handleFetchData())
        .then(() => this.props.closeModal());
    }
    return () => {};
  };

  render() {
    const allDocuments = this.props.project.project_decision_package?.documents || [];
    const hasDecisionPackageDocuments =
      allDocuments?.filter((doc) => doc.project_decision_package_document_type_code === "DCP")
        ?.length > 0;

    return (
      <Form layout="vertical">
        <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <ScrollSideMenu
            menuOptions={[
              { href: "decision-package-documents", title: "Decision Package" },
              { href: "additional-goverment-documents", title: "Government Documents" },
              { href: "internal-ministry-documents", title: "Internal Documents" },
            ]}
            featureUrlRoute={routes.PROJECT_PERMIT_PACKAGE.hashRoute}
            featureUrlRouteArguments={[this.props.match?.params?.projectGuid]}
          />
        </div>
        <div
          className={
            this.state.fixedTop ? "side-menu--content with-fixed-top top-125" : "side-menu--content"
          }
        >
          <Row>
            <Col span={24}>
              <Alert
                message={
                  <>
                    <Row>
                      <Col xs={24} md={18}>
                        In Progress
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item>
                          <Field
                            id="status_code"
                            name="status_code"
                            component={renderConfig.SELECT}
                            placeholder="Select new status"
                            data={[]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                }
                description="This decision package is in progress. You can now add and remove relevant documents to this decision package. Proponents will not see decision package files until it is completed."
                type="warning"
                showIcon
              />
              <br />
            </Col>
            <Col span={24}>
              <Typography.Title level={3}>
                <FolderViewOutlined className="violet" />
                &nbsp;Decision Package (Proponent Visible)
              </Typography.Title>
              <hr />
            </Col>
          </Row>
          {this.renderDocumentSection(
            <Row>
              <Col xs={24} md={12}>
                Decision Package Documents
              </Col>
              <Col xs={24} md={12}>
                <Button
                  type="primary"
                  style={{ float: "right" }}
                  onClick={() => this.handleOpenModal("decision-package")}
                >
                  + Add Documents
                </Button>
                <Button
                  type="secondary"
                  style={{ float: "right" }}
                  disabled={!hasDecisionPackageDocuments}
                >
                  <img name="edit" src={EDIT_OUTLINE_VIOLET} alt="Edit" />
                  &nbsp; Edit Package
                </Button>
              </Col>
            </Row>,
            "decision-package-documents",
            <Typography.Text>
              <b>These files are visible to the proponent.</b> Upload Ministry Decision
              documentation.
            </Typography.Text>,
            allDocuments?.filter(
              (doc) => doc.project_decision_package_document_type_code === "DCP"
            ) || []
          )}
          <br />
          {this.renderDocumentSection(
            "Additional Government Documents",
            "additional-goverment-documents",
            <Typography.Text>
              <b>These files are visible to the proponent.</b> Upload Supplemental Ministry
              documentation.
            </Typography.Text>,
            allDocuments?.filter(
              (doc) => doc.project_decision_package_document_type_code === "ADG"
            ) || []
          )}
          <br />
          <Row>
            <Col span={24}>
              <Typography.Title level={3}>
                <LockOutlined className="violet" />
                &nbsp;Confidential Internal Documents (Ministry Visible Only)
              </Typography.Title>
              <hr />
            </Col>
          </Row>
          {this.renderDocumentSection(
            <Row>
              <Col xs={24} md={12}>
                Internal Ministry Documentation
              </Col>
              <Col xs={24} md={12}>
                <Button
                  type="primary"
                  style={{ float: "right" }}
                  onClick={() => this.handleOpenModal("internal")}
                >
                  + Add Documents
                </Button>
              </Col>
            </Row>,
            "internal-ministry-documents",
            <Typography.Text>
              <b>These files are for internal staff only and will not be shown to proponents.</b>{" "}
              Upload internal documents that are created durring the review process.
            </Typography.Text>,
            allDocuments?.filter(
              (doc) => doc.project_decision_package_document_type_code === "INM"
            ) || []
          )}
        </div>
      </Form>
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
      createProjectDecisionPackage,
      openModal,
      closeModal,
    },
    dispatch
  );

DecisionPackageTab.propTypes = propTypes;

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.UPDATE_PROJECT_DECISION_PACKAGE,
    enableReinitialize: true,
  })
)(DecisionPackageTab);
