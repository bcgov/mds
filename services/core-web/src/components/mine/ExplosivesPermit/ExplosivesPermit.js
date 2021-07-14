import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
  updateExplosivesPermit,
  deleteExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import {
  fetchExplosivesPermitDocumentContextTemplate,
  generateExplosivesPermitDocument,
} from "@/actionCreators/documentActionCreator";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
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
  isPermitTab: PropTypes.bool,
  mineGuid: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  updateExplosivesPermit: PropTypes.func.isRequired,
  createExplosivesPermit: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchExplosivesPermits: PropTypes.func.isRequired,
  deleteExplosivesPermit: PropTypes.func.isRequired,
  fetchExplosivesPermitDocumentContextTemplate: PropTypes.func.isRequired,
  generateExplosivesPermitDocument: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  documentContextTemplate: PropTypes.objectOf(PropTypes.string).isRequired,
  explosivesPermits: PropTypes.arrayOf(CustomPropTypes.explosivesPermit).isRequired,
  explosivesPermitStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  explosivesPermitDocumentTypeDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  explosivesPermitDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  isPermitTab: false,
};

export class ExplosivesPermit extends Component {
  state = { expandedRowKeys: [] };

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  handleAddExplosivesPermit = (values) => {
    const system = values.permit_tab ? "MMS" : "Core";
    const payload = {
      originating_system: system,
      ...values,
    };
    return this.props.createExplosivesPermit(this.props.mineGuid, payload).then(() => {
      this.props.fetchExplosivesPermits(this.props.mineGuid);
      this.props.closeModal();
    });
  };

  handleOpenAddExplosivesPermitModal = (event, isPermitTab, record = null) => {
    const initialValues = record || { permit_tab: isPermitTab };
    const isProcessed = record && record?.application_status !== "REC";
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: record ? this.handleUpdateExplosivesPermit : this.handleAddExplosivesPermit,
        title: "Add Explosives Storage & Use Permit",
        initialValues,
        mineGuid: this.props.mineGuid,
        isProcessed,
        documentTypeDropdownOptions: this.props.explosivesPermitDocumentTypeDropdownOptions,
        isPermitTab,
        inspectors: this.props.inspectors,
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
    const initialValues = record || {};
    delete initialValues.application_status;
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateExplosivesPermit,
        title: "Update Explosives Permit Status",
        initialValues,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_STATUS_MODAL,
    });
  };

  handleOpenExplosivesPermitCloseModal = (event, record = null) => {
    const initialValues = record || {};
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateExplosivesPermit,
        title: "Update Explosives Permit Status",
        initialValues,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_CLOSE_MODAL,
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

  handleIssueExplosivesPermit = (values, record) => {
    const payload = { ...record, ...values, application_status: "APP" };
    return this.props
      .updateExplosivesPermit(this.props.mineGuid, record.explosives_permit_guid, payload)
      .then(() => {
        this.props.fetchExplosivesPermits(this.props.mineGuid);
        this.props.closeModal();
      });
  };

  handleDeleteExplosivesPermit = (event, record) => {
    event.preventDefault();
    return this.props
      .deleteExplosivesPermit(this.props.mineGuid, record.explosives_permit_guid)
      .then(() => {
        this.props.fetchExplosivesPermits(this.props.mineGuid);
      });
  };

  handleDocumentPreview = (documentTypeCode, values, record) => {
    const payload = {
      explosives_permit_guid: record.explosives_permit_guid,
      template_data: values,
    };
    return this.props.generateExplosivesPermitDocument(
      documentTypeCode,
      payload,
      "Successfully generated preview of Explosives Permit document",
      true
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
            inspectors: this.props.inspectors,
            onSubmit: (values) => this.handleIssueExplosivesPermit(values, record),
            previewDocument: (documentTypeCode, values) =>
              this.handleDocumentPreview(documentTypeCode, values, record),
            title: "Issue Explosives Storage & Use Permit",
          },
          width: "75vw",
          content: modalConfig.EXPLOSIVES_PERMIT_DECISION_MODAL,
        });
      });
  };

  render() {
    const title = this.props.isPermitTab
      ? "Explosives Storage & Use Permit"
      : "Explosives Storage & Use Permit Applications";
    const data = this.props.isPermitTab
      ? this.props.explosivesPermits.filter(
          ({ application_status }) => application_status === "APP"
        )
      : this.props.explosivesPermits;
    return (
      <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">{title}</h4>
          <AuthorizationWrapper
            permission={
              this.props.isPermitTab ? Permission.ADMIN : Permission.EDIT_EXPLOSIVES_PERMITS
            }
          >
            <AddButton
              onClick={(e) => this.handleOpenAddExplosivesPermitModal(e, this.props.isPermitTab)}
            >
              Add {title}
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <br />
        <MineExplosivesPermitTable
          onExpand={this.onExpand}
          expandedRowKeys={this.state.expandedRowKeys}
          isLoaded
          data={data}
          isPermitTab={this.props.isPermitTab}
          handleOpenExplosivesPermitDecisionModal={this.handleOpenExplosivesPermitDecisionModal}
          handleOpenAddExplosivesPermitModal={this.handleOpenAddExplosivesPermitModal}
          handleOpenViewMagazineModal={this.handleOpenViewMagazineModal}
          explosivesPermitStatusOptionsHash={this.props.explosivesPermitStatusOptionsHash}
          explosivesPermitDocumentTypeOptionsHash={
            this.props.explosivesPermitDocumentTypeOptionsHash
          }
          handleOpenExplosivesPermitStatusModal={this.handleOpenExplosivesPermitStatusModal}
          handleDeleteExplosivesPermit={this.handleDeleteExplosivesPermit}
          handleOpenExplosivesPermitCloseModal={this.handleOpenExplosivesPermitCloseModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mines: getMines(state),
  inspectors: getDropdownInspectors(state),
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
      deleteExplosivesPermit,
    },
    dispatch
  );

ExplosivesPermit.propTypes = propTypes;
ExplosivesPermit.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
