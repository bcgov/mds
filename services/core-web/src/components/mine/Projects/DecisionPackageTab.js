import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { getFormValues } from "redux-form";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Button } from "antd";
import { LockOutlined, FolderViewOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchProjectById,
  createProjectDecisionPackage,
  updateProjectDecisionPackage,
  removeDocumentFromProjectDecisionPackage,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as routes from "@/constants/routes";
import customPropTypes from "@/customPropTypes";
import ScrollSideMenu from "@mds/common/components/common/ScrollSideMenu";
import DocumentTable from "@/components/common/DocumentTable";
import UpdateDecisionPackageStatusForm from "@/components/Forms/majorMineApplication/UpdateDecisionPackageStatusForm";
import { modalConfig } from "@/components/modalContent/config";
import { getProjectDecisionPackageStatusCodesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { Feature } from "@mds/common";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import * as Strings from "@mds/common/constants/strings";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  project: customPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  archivedDocuments: PropTypes.arrayOf(customPropTypes.mineDocument),
  fetchMineDocuments: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isFeatureEnabled: PropTypes.func.isRequired,
  updateProjectDecisionPackage: PropTypes.func.isRequired,
  createProjectDecisionPackage: PropTypes.func.isRequired,
  removeDocumentFromProjectDecisionPackage: PropTypes.func.isRequired,
  projectDecisionPackageStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
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

  handleFetchData = async () => {
    const { projectGuid } = this.props.match?.params;
    const project = await this.props.fetchProjectById(projectGuid);
    const decisionPackageGuid = project?.project_decision_package?.project_decision_package_guid;
    if (decisionPackageGuid) {
      await this.props.fetchMineDocuments(project.mine_guid, {
        is_archived: true,
        project_decision_package_guid: decisionPackageGuid,
      });
    }
  };

  componentDidUpdate(nextProps) {
    if (
      nextProps.match.params.tab !== this.props.match.params.tab &&
      this.props.match.params.tab === "project-decision-package"
    ) {
      this.handleFetchData();
    }
  }

  handleUpdateProjectDecisionPackage = (event, values) => {
    event.preventDefault();
    const { projectGuid } = this.props.match?.params;
    const projectDecisionPackage = this.props.project.project_decision_package;
    const projectDecisionPackageGuid = projectDecisionPackage?.project_decision_package_guid;

    if (!projectDecisionPackageGuid) {
      return this.props
        .createProjectDecisionPackage(
          {
            projectGuid: this.props.project?.project_guid,
          },
          values
        )
        .then(() => this.handleFetchData());
    }
    return this.props
      .updateProjectDecisionPackage(
        {
          projectGuid,
          projectDecisionPackageGuid,
        },
        values
      )
      .then(() => this.handleFetchData());
  };

  handleDeleteDocument = (event, documentKey) => {
    event.preventDefault();
    const { project_guid: projectGuid, project_decision_package } = this.props.project;

    return this.props
      .removeDocumentFromProjectDecisionPackage(
        projectGuid,
        project_decision_package?.project_decision_package_guid,
        documentKey
      )
      .then(() => this.handleFetchData());
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
        href="archived-documents-decision-package"
      />
    );
  };

  renderDocumentSection = (project, sectionTitle, sectionHref, sectionText, sectionDocuments) => {
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
          enableBulkActions={true}
          documents={sectionDocuments?.reduce(
            (docs, doc) => [
              {
                key: doc.mine_document_guid,
                mine_document_guid: doc.mine_document_guid,
                document_manager_guid: doc.document_manager_guid,
                document_name: doc.document_name,
                upload_date: doc.upload_date,
              },
              ...docs,
            ],
            []
          )}
          excludedColumnKeys={["category"]}
          additionalColumnProps={[{ key: "name", colProps: { width: "80%" } }]}
          canArchiveDocuments={true}
          archiveDocumentsArgs={{ mineGuid: project?.mine_guid }}
          onArchivedDocuments={this.handleFetchData}
          removeDocument={this.handleDeleteDocument}
          showVersionHistory={true}
        />
      </div>
    );
  };

  handleOpenModal = (modalType) => {
    let title;
    let contentTitle;
    let instructions;
    let content = modalConfig.UPLOAD_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL;
    let submitHandler = this.handleUploadDocument;
    let optionalProps = {};
    if (modalType === "upload-document") {
      title = "Upload Documents";
      instructions =
        "Please upload all relevant decision documentation below. You can add this set of files directly to your decision package by selecting the option below.";
      contentTitle = "Upload Documents";
    } else if (modalType === "internal") {
      title = "Upload Internal Documents";
      instructions =
        "Upload internal documents that are created durring the review process. These files are for internal staff only and will not be shown to proponents.";
      contentTitle = "Upload Internal Ministry Document";
    } else if (modalType === "edit-decision-package") {
      content = modalConfig.UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL;
      submitHandler = this.handleUpdateProjectDecisionPackage;
      optionalProps = {
        documents: this.props.project.project_decision_package?.documents,
        status_code: this.props.project.project_decision_package?.status_code,
      };
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
        optionalProps,
      },
      content,
    });
  };

  handleUploadDocument = (event, values, flags) => {
    const payload = {
      documents: values.map((doc) => {
        // Determine document type
        const { isDecisionPackageEligible, addFilesToDecisionPackage } = flags;
        let project_decision_package_document_type_code;
        if (isDecisionPackageEligible && addFilesToDecisionPackage) {
          project_decision_package_document_type_code = "DCP";
        } else if (isDecisionPackageEligible && !addFilesToDecisionPackage) {
          project_decision_package_document_type_code = "ADG";
        } else {
          project_decision_package_document_type_code = "INM";
        }
        return {
          ...doc,
          project_decision_package_document_type_code,
        };
      }),
      status_code: this.props.formValues?.status_code,
    };
    this.handleUpdateProjectDecisionPackage(event, payload);
    return this.props.closeModal();
  };

  render() {
    const projectDecisionPackage = this.props.project.project_decision_package;
    const allDocuments = projectDecisionPackage?.documents;
    const hasStartedPackage =
      Boolean(projectDecisionPackage?.project_decision_package_guid) &&
      projectDecisionPackage?.status_code !== "NTS";

    const canArchiveDocuments = this.props.isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE);
    const menuOptions = [
      { href: "decision-package-documents", title: "Decision Package" },
      { href: "additional-goverment-documents", title: "Government Documents" },
      { href: "internal-ministry-documents", title: "Internal Documents" },
      canArchiveDocuments && {
        href: "archived-documents-decision-package",
        title: "Archived Documents",
      },
    ].filter(Boolean);

    return (
      <>
        <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <ScrollSideMenu
            menuOptions={menuOptions}
            featureUrlRoute={routes.PROJECT_DECISION_PACKAGE.hashRoute}
            featureUrlRouteArguments={[this.props.match?.params?.projectGuid]}
          />
        </div>
        <div className={this.state.fixedTop ? "side-menu--content top-125" : "side-menu--content"}>
          <Row>
            <UpdateDecisionPackageStatusForm
              initialValues={{
                status_code: projectDecisionPackage?.status_code || "NTS",
              }}
              displayValues={{
                status_code: projectDecisionPackage?.status_code || "NTS",
                projectDecisionPackageStatusCodesHash: this.props
                  ?.projectDecisionPackageStatusCodesHash,
                updateUser: projectDecisionPackage?.update_user,
                updateDate: projectDecisionPackage?.update_timestamp,
                documents: projectDecisionPackage?.documents,
              }}
              handleSubmit={this.handleUpdateProjectDecisionPackage}
            />
            <Col span={24}>
              <Typography.Title level={3}>
                <br />
                <FolderViewOutlined className="violet" />
                &nbsp;Decision Package (Proponent Visible)
              </Typography.Title>
              <hr />
            </Col>
          </Row>
          {this.renderDocumentSection(
            this.props.project,
            <Row>
              <Col xs={24} md={12}>
                Decision Package Documents
              </Col>
              <Col xs={24} md={12}>
                <Button
                  type="primary"
                  style={{ float: "right" }}
                  disabled={!hasStartedPackage}
                  onClick={() => this.handleOpenModal("upload-document")}
                >
                  + Add Documents
                </Button>
                <Button
                  type="secondary"
                  style={{ float: "right" }}
                  disabled={!hasStartedPackage || allDocuments?.length === 0}
                  onClick={() => this.handleOpenModal("edit-decision-package")}
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
            this.props.project,
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
            this.props.project,
            <Row>
              <Col xs={24} md={12}>
                Internal Ministry Documentation
              </Col>
              <Col xs={24} md={12}>
                <Button
                  type="primary"
                  style={{ float: "right" }}
                  disabled={!hasStartedPackage}
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
          {this.renderArchivedDocumentsSection(this.props.mineDocuments)}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  projectDecisionPackageStatusCodesHash: getProjectDecisionPackageStatusCodesHash(state),
  formValues: getFormValues(FORM.UPDATE_PROJECT_DECISION_PACKAGE)(state) || {},
  mineDocuments: getMineDocuments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateProjectDecisionPackage,
      fetchProjectById,
      createProjectDecisionPackage,
      removeDocumentFromProjectDecisionPackage,
      fetchMineDocuments,
      openModal,
      closeModal,
    },
    dispatch
  );

DecisionPackageTab.propTypes = propTypes;

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withFeatureFlag(DecisionPackageTab));
