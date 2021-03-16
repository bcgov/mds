/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Menu, Dropdown } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { formatDate } from "@common/utils/helpers";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
} from "@common/selectors/noticeOfWorkSelectors";
import {
  generateNoticeOfWorkApplicationDocument,
  exportNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import * as routes from "@/constants/routes";
import { EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationAdministrative from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import PermitAmendmentSecurityForm from "@/components/Forms/permits/PermitAmendmentSecurityForm";

/**
 * @class AdministrativeTab- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
};

export class AdministrativeTab extends Component {
  state = {
    associatedLeadInspectorPartyGuid: undefined,
    associatedIssuingInspectorPartyGuid: undefined,
    adminMenuVisible: false,
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
            title: `Generate ${documentType.description}`,
            signature,
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
        () => {
          this.setState({ isLoaded: false });
          this.props
            .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
            .then(() => this.setState({ isLoaded: true }));
        }
      )
      .then(() => {
        this.props.closeModal();
      });
  };

  handleChangeNOWMineAndLocation = (values) => {
    const message = values.latitude
      ? "Successfully updated Notice of Work location"
      : "Successfully transferred Notice of Work";
    this.props
      .updateNoticeOfWorkApplication(values, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
    this.props.closeModal();
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
    return (
      <Menu>
        <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="transfer-to-a-different-mine"
            className="custom-menu-item"
            onClick={() => this.openChangeNOWMineModal(this.props.noticeOfWork)}
          >
            Transfer to a Different Mine
          </Menu.Item>
        </NOWActionWrapper>
        <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="edit-application-lat-long"
            className="custom-menu-item"
            onClick={() => this.openChangeNOWLocationModal(this.props.noticeOfWork)}
          >
            Edit Application Lat/Long
          </Menu.Item>
        </NOWActionWrapper>
        {Object.values(this.props.generatableApplicationDocuments).length > 0 && (
          <Menu.SubMenu key="generate-documents" title="Generate Documents">
            {Object.values(this.props.generatableApplicationDocuments)
              .filter(
                ({ now_application_document_type_code }) =>
                  now_application_document_type_code === "CAL"
              )
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

  handleUpdateInspectors = (finalAction) => {
    if (
      (!this.state.associatedLeadInspectorPartyGuid ||
        this.state.associatedLeadInspectorPartyGuid ===
          this.props.noticeOfWork.lead_inspector_party_guid) &&
      (!this.state.associatedIssuingInspectorPartyGuid ||
        this.state.associatedIssuingInspectorPartyGuid ===
          this.props.noticeOfWork.issuing_inspector_party_guid)
    ) {
      finalAction();
      return;
    }
    this.props
      .updateNoticeOfWorkApplication(
        {
          lead_inspector_party_guid: this.state.associatedLeadInspectorPartyGuid,
          issuing_inspector_party_guid: this.state.associatedIssuingInspectorPartyGuid,
        },
        this.props.noticeOfWork.now_application_guid,
        "Successfully updated the assigned inspectors"
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      })
      .then(() => finalAction());
  };

  setLeadInspectorPartyGuid = (leadInspectorPartyGuid) =>
    this.setState({
      associatedLeadInspectorPartyGuid: leadInspectorPartyGuid,
    });

  setIssuingInspectorPartyGuid = (issuingInspectorPartyGuid) =>
    this.setState({
      associatedIssuingInspectorPartyGuid: issuingInspectorPartyGuid,
    });

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
          <NOWSideMenu
            route={routes.NOTICE_OF_WORK_APPLICATION}
            noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
            tabSection="administrative"
          />
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
            setLeadInspectorPartyGuid={this.setLeadInspectorPartyGuid}
            setIssuingInspectorPartyGuid={this.setIssuingInspectorPartyGuid}
            handleUpdateInspectors={this.handleUpdateInspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
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
