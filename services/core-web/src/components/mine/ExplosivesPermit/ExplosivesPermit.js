/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
  updateExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import {
  fetchExplosivesPermitDocumentContextTemplate,
  generateExplosivesPermitDocument,
} from "@/actionCreators/documentActionCreator";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import {
  getExplosivesPermitStatusOptionsHash,
  getExplosivesPermitDocumentTypeOptionsHash,
  getExplosivesPermitDocumentTypeDropdownOptions,
} from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import CustomPropTypes from "@/customPropTypes";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  isPermit: PropTypes.bool,
  updateExplosivesPermit: PropTypes.func.isRequired,
  createExplosivesPermit: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchExplosivesPermits: PropTypes.func.isRequired,
  updateExplosivesPermit: PropTypes.func.isRequired,
  fetchExplosivesPermitDocumentContextTemplate: PropTypes.func.isRequired,
  generateExplosivesPermitDocument: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  documentContextTemplate: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  isPermit: false,
};

export class ExplosivesPermit extends Component {
  state = { isLoaded: false, params: {} };

  handleAddExplosivesPermit = (values) => {
    const payload = {
      originating_system: "Core",
      ...values,
    };
    return this.props.createExplosivesPermit(this.props.mineGuid, payload).then(() => {
      this.props.fetchExplosivesPermits(this.props.mineGuid);
      this.props.closeModal();
    });
  };

  handleOpenAddExplosivesPermitModal = (event, record = null) => {
    const initialValues = record ? record : {};
    const isApproved = record?.application_status === "APP";
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: record ? this.handleUpdateExplosivesPermit : this.handleAddExplosivesPermit,
        title: "Add Explosives Storage & Use Permit",
        initialValues,
        mineGuid: this.props.mineGuid,
        isApproved,
        documentTypeDropdownOptions: this.props.explosivesPermitDocumentTypeDropdownOptions,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  };

  handleUpdateExplosivesPermit = (values) => {
    const payload = {
      ...values,
    };
    return this.props
      .updateExplosivesPermit(this.props.mineGuid, values.explosives_permit_guid, payload)
      .then(() => {
        this.props.fetchExplosivesPermits(this.props.mineGuid);
        this.props.closeModal();
      });
  };

  handleOpenExplosivesPermitStatusModal = (event, record = null) => {
    const initialValues = record ? record : {};
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdatePermit,
        title: "Update Explosives Permit Status",
        initialValues,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_STATUS_MODAL,
    });
  };

  handleOpenViewMagazineModal = (event, record, type) => {
    const mine = this.props.mines[this.props.mineGuid];
    const title = type === "EXP" ? "Explosive Magazine" : "Detonator Magazine";
    event.preventDefault();
    this.props.openModal({
      props: {
        title,
        explosivesPermit: record,
        type,
        mine,
      },
      content: modalConfig.VIEW_MAGAZINE_MODAL,
      isViewOnly: true,
    });
  };

  handleIssueExplosivesPermit = (explosivesPermitGuid, values) => {
    const payload = {
      application_status: "APP",
      ...values,
    };
    return this.props
      .updateExplosivesPermit(this.props.mineGuid, explosivesPermitGuid, payload)
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

  handleOpenExplosivesPermitDecisionModal = (event, record) => {
    event.preventDefault();
    return this.props
      .fetchExplosivesPermitDocumentContextTemplate("LET", record.explosives_permit_guid)
      .then(() => {
        const initialValues = {};
        this.props.documentContextTemplate.document_template.form_spec.map(
          // eslint-disable-next-line
          (item) => (initialValues[item.id] = item["context-value"])
        );
        return this.props.openModal({
          props: {
            initialValues,
            documentType: this.props.documentContextTemplate,
            onSubmit: (values) =>
              this.handleIssueExplosivesPermit(record.explosives_permit_guid, values),
            preview: this.handleDocumentPreview,
            title: "Issue Explosives Storage & Use Permit",
          },
          width: "75vw",
          content: modalConfig.EXPLOSIVES_PERMIT_DECISION_MODAL,
        });
      });
  };

  render() {
    const title = this.props.isPermit
      ? "Explosives Storage & Use Permits"
      : "Explosives Storage & Use Permit Applications";
    const data = this.props.isPermit
      ? this.props.explosivesPermits.filter(
          ({ application_status }) => application_status === "APP"
        )
      : this.props.explosivesPermits;
    return (
      <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">{title}</h4>
          {!this.props.isPermit && (
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <AddButton onClick={(e) => this.handleOpenAddExplosivesPermitModal(e)}>
                Add Explosives Storage & Use Permit Application
              </AddButton>
            </AuthorizationWrapper>
          )}
        </div>
        <br />
        <MineExplosivesPermitTable
          isLoaded
          data={data}
          isPermit={this.props.isPermit}
          handleOpenExplosivesPermitDecisionModal={this.handleOpenExplosivesPermitDecisionModal}
          handleOpenAddExplosivesPermitModal={this.handleOpenAddExplosivesPermitModal}
          handleOpenViewMagazineModal={this.handleOpenViewMagazineModal}
          explosivesPermitStatusOptionsHash={this.props.explosivesPermitStatusOptionsHash}
          explosivesPermitDocumentTypeOptionsHash={
            this.props.explosivesPermitDocumentTypeOptionsHash
          }
          handleOpenExplosivesPermitStatusModal={this.handleOpenExplosivesPermitStatusModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mines: getMines(state),
  explosivesPermits: getExplosivesPermits(state),
  explosivesPermitStatusOptionsHash: getExplosivesPermitStatusOptionsHash(state),
  explosivesPermitDocumentTypeOptionsHash: getExplosivesPermitDocumentTypeOptionsHash(state),
  explosivesPermitDocumentTypeDropdownOptions: getExplosivesPermitDocumentTypeDropdownOptions(
    state
  ),
  documentContextTemplate: getDocumentContextTemplate(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createExplosivesPermit,
      openModal,
      closeModal,
      fetchExplosivesPermits,
      updateExplosivesPermit,
      fetchExplosivesPermitDocumentContextTemplate,
      generateExplosivesPermitDocument,
    },
    dispatch
  );

ExplosivesPermit.propTypes = propTypes;
ExplosivesPermit.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
