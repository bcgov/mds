import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Menu, Dropdown } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { formatDate } from "@common/utils/helpers";
import { DownOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationAdministrative from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";

/**
 * @class AdministrativeTab- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  generatableApplicationDocuments: PropTypes.objectOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  fetchNoticeOfWorkApplicationContextTemplate: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.bool.isRequired,
  documentContextTemplate: PropTypes.objectOf(PropTypes.string).isRequired,
  generateNoticeOfWorkApplicationDocument: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
};

export class AdministrativeTab extends Component {
  state = {
    adminMenuVisible: false,
    isInspectorsLoaded: true,
  };

  handleAdminVisibleChange = (flag) => {
    this.setState({ adminMenuVisible: flag });
  };

  handleMenuClick = () => {
    this.setState({ adminMenuVisible: false });
  };

  handleGenerateDocument = (menuItem) => {
    const documentTypeCode = menuItem.key;
    const documentType = this.props.generatableApplicationDocuments[documentTypeCode];
    const signature = this.props.noticeOfWork?.issuing_inspector?.signature;
    this.props
      .fetchNoticeOfWorkApplicationContextTemplate(
        documentTypeCode,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        const initialValues = {};
        this.props.documentContextTemplate.document_template.form_spec.map(
          // eslint-disable-next-line
          (item) => (initialValues[item.id] = item["context-value"])
        );
        this.props.openModal({
          props: {
            initialValues,
            documentType: this.props.documentContextTemplate,
            onSubmit: (values) => this.handleGenerateDocumentFormSubmit(documentType, values),
            preview: this.handleDocumentPreview,
            title: `Generate ${documentType.description}`,
            signature,
            allowDocx: true,
          },
          width: "75vw",
          content: modalConfig.GENERATE_DOCUMENT,
        });
      });
  };

  handleGenerateDocumentFormSubmit = (documentType, values) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return this.props
      .generateNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        "Successfully created document and attached it to Notice of Work",
        false,
        () => {
          this.props.fetchImportedNoticeOfWorkApplication(
            this.props.noticeOfWork.now_application_guid
          );
        }
      )
      .then(() => {
        this.props.closeModal();
      });
  };

  handleDocumentPreview = (documentType, values) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: this.props.noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return this.props.generateNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload,
      "Successfully created the preview document",
      true,
      () => {}
    );
  };

  handleChangeNOWMineAndLocation = (values) => {
    const message = values.latitude
      ? "Successfully updated Notice of Work location"
      : "Successfully transferred Notice of Work";
    return this.props
      .updateNoticeOfWorkApplication(values, this.props.noticeOfWork.now_application_guid, message)
      .then(() =>
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        )
      )
      .then(() => this.props.closeModal());
  };

  openChangeNOWMineModal = (noticeOfWork) => {
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
        },
        onSubmit: this.handleChangeNOWMineAndLocation,
        title: `Transfer Notice of Work`,
        noticeOfWork,
      },
      width: "75vw",
      content: modalConfig.CHANGE_NOW_MINE,
    });
  };

  openChangeNOWLocationModal = (noticeOfWork) => {
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: noticeOfWork.mine_guid,
          latitude: noticeOfWork.latitude,
          longitude: noticeOfWork.longitude,
        },
        mineGuid: noticeOfWork.mine_guid,
        onSubmit: this.handleChangeNOWMineAndLocation,
        title: `Edit Location`,
        noticeOfWork,
      },
      width: "75vw",
      content: modalConfig.CHANGE_NOW_LOCATION,
    });
  };

  menu = () => {
    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";
    const generateLettersList = isNoWApplication ? ["CAL", "NPE"] : ["NPE"];
    return (
      <Menu>
        {isNoWApplication && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item
              key="transfer-to-a-different-mine"
              className="custom-menu-item"
              onClick={() => this.openChangeNOWMineModal(this.props.noticeOfWork)}
            >
              Transfer to a Different Mine
            </Menu.Item>
          </NOWActionWrapper>
        )}
        <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="edit-application-lat-long"
            className="custom-menu-item"
            onClick={() => this.openChangeNOWLocationModal(this.props.noticeOfWork)}
          >
            Edit Application Lat/Long
          </Menu.Item>
        </NOWActionWrapper>
        {this.props.generatableApplicationDocuments &&
          Object.values(this.props.generatableApplicationDocuments).length > 0 && (
            <Menu.SubMenu key="generate-documents" title="Generate Documents">
              {Object.values(this.props.generatableApplicationDocuments)
                .filter(({ now_application_document_type_code }) =>
                  generateLettersList.includes(now_application_document_type_code)
                )
                .sort((docA, docB) => docA.description.localeCompare(docB.description))
                .map((document) => (
                  <Menu.Item
                    key={document.now_application_document_type_code}
                    onClick={this.handleGenerateDocument}
                  >
                    {document.description}
                  </Menu.Item>
                ))}
            </Menu.SubMenu>
          )}
      </Menu>
    );
  };

  handleUpdateInspectors = (values, finalAction) => {
    this.setState({ isInspectorsLoaded: false });
    return this.props
      .updateNoticeOfWorkApplication(
        values,
        this.props.noticeOfWork.now_application_guid,
        "Successfully updated the assigned inspectors"
      )
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.setState({ isInspectorsLoaded: true });
            finalAction();
          });
      });
  };

  handleSaveNOWEdit = () => {
    return this.props
      .updateNoticeOfWorkApplication(
        this.props.formValues,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  render() {
    return (
      <div>
        <NOWTabHeader
          tab="ADMIN"
          tabName="Administrative"
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          tabActions={
            <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
              <Dropdown
                overlay={this.menu(false)}
                placement="bottomLeft"
                onVisibleChange={this.handleAdminVisibleChange}
                visible={this.state.adminMenuVisible}
              >
                <Button type="secondary" className="full-mobile">
                  Actions
                  <DownOutlined />
                </Button>
              </Dropdown>
            </NOWActionWrapper>
          }
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu tabSection="administrative" />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <NOWApplicationAdministrative
            mineGuid={this.props.noticeOfWork.mine_guid}
            noticeOfWork={this.props.noticeOfWork}
            inspectors={this.props.inspectors}
            handleUpdateInspectors={this.handleUpdateInspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
            isLoaded={this.state.isInspectorsLoaded}
            draftPermitAmendment={this.props.draftPermitAmendment}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  inspectors: getDropdownInspectors(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  documentContextTemplate: getDocumentContextTemplate(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      openModal,
      closeModal,
      fetchNoticeOfWorkApplicationContextTemplate,
      generateNoticeOfWorkApplicationDocument,
    },
    dispatch
  );

AdministrativeTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(AdministrativeTab);
