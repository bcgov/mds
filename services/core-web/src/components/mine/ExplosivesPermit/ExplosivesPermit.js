import React, { useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
  updateExplosivesPermit,
  deleteExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import {
  getExplosivesPermitStatusOptionsHash,
  getExplosivesPermitDocumentTypeOptionsHash,
  getExplosivesPermitDocumentTypeDropdownOptions,
} from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import {
  fetchExplosivesPermitDocumentContextTemplate,
  generateExplosivesPermitDocument,
} from "@/actionCreators/documentActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
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

export const ExplosivesPermit = (props) => {
  const {
    mineGuid,
    mines,
    inspectors,
    isPermitTab,
    explosivesPermits,
    explosivesPermitDocumentTypeDropdownOptions,
  } = props;

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const onExpand = (expanded, record) => {
    const newExpandedRowKeys = expanded
      ? expandedRowKeys.concat(record.key)
      : expandedRowKeys.filter((key) => key !== record.key);
    setExpandedRowKeys(newExpandedRowKeys);
  };

  const handleAddExplosivesPermit = (values) => {
    const system = values.permit_tab ? "MMS" : "Core";
    const payload = {
      originating_system: system,
      ...values,
    };
    return props.createExplosivesPermit(mineGuid, payload).then(() => {
      props.fetchExplosivesPermits(mineGuid);
      props.closeModal();
    });
  };

  const handleUpdateExplosivesPermit = (values) => {
    const payload = {
      ...values,
    };
    return props
      .updateExplosivesPermit(mineGuid, values.explosives_permit_guid, payload)
      .then(() => {
        props.fetchExplosivesPermits(mineGuid);
        props.closeModal();
      });
  };

  const handleOpenAddExplosivesPermitModal = (event, permitTab, record = null) => {
    const initialValues = record || { permit_tab: permitTab };
    const isProcessed = record && record?.application_status !== "REC";
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: record ? handleUpdateExplosivesPermit : handleAddExplosivesPermit,
        title: "Add Explosives Storage & Use Permit",
        initialValues,
        mineGuid,
        isProcessed,
        documentTypeDropdownOptions: explosivesPermitDocumentTypeDropdownOptions,
        isPermitTab: permitTab,
        inspectors,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  };

  const handleOpenExplosivesPermitStatusModal = (event, record = null) => {
    const initialValues = record || {};
    delete initialValues.application_status;
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleUpdateExplosivesPermit,
        title: "Update Explosives Permit Status",
        initialValues,
        mineGuid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_STATUS_MODAL,
    });
  };

  const handleOpenExplosivesPermitCloseModal = (event, record = null) => {
    const initialValues = record || {};
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleUpdateExplosivesPermit,
        title: "Update Explosives Permit Status",
        initialValues,
        mineGuid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_CLOSE_MODAL,
    });
  };

  const handleOpenViewMagazineModal = (event, record, type) => {
    const mine = mines[mineGuid];
    const title = type === "EXP" ? "Explosive Magazine" : "Detonator Magazine";
    event.preventDefault();
    props.openModal({
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

  const handleIssueExplosivesPermit = (values, record) => {
    const payload = { ...record, ...values, application_status: "APP" };
    return props
      .updateExplosivesPermit(mineGuid, record.explosives_permit_guid, payload)
      .then(() => {
        props.fetchExplosivesPermits(mineGuid);
        props.closeModal();
      });
  };

  const handleDeleteExplosivesPermit = (event, record) => {
    event.preventDefault();
    return props.deleteExplosivesPermit(mineGuid, record.explosives_permit_guid).then(() => {
      props.fetchExplosivesPermits(mineGuid);
    });
  };

  const handleDocumentPreview = (documentTypeCode, values, record) => {
    const payload = {
      explosives_permit_guid: record.explosives_permit_guid,
      template_data: values,
    };
    return props.generateExplosivesPermitDocument(
      documentTypeCode,
      payload,
      "Successfully generated preview of Explosives Permit document",
      true
    );
  };

  const handleOpenExplosivesPermitDecisionModal = (event, record) => {
    event.preventDefault();
    return props
      .fetchExplosivesPermitDocumentContextTemplate("LET", record.explosives_permit_guid)
      .then(() => {
        const initialValues = {};
        props.documentContextTemplate.document_template.form_spec.map(
          // eslint-disable-next-line no-return-assign
          (item) => (initialValues[item.id] = item["context-value"])
        );
        return props.openModal({
          props: {
            initialValues,
            documentType: props.documentContextTemplate,
            inspectors,
            onSubmit: (values) => handleIssueExplosivesPermit(values, record),
            previewDocument: (documentTypeCode, values) =>
              handleDocumentPreview(documentTypeCode, values, record),
            title: "Issue Explosives Storage & Use Permit",
          },
          width: "75vw",
          content: modalConfig.EXPLOSIVES_PERMIT_DECISION_MODAL,
        });
      });
  };

  const title = isPermitTab
    ? "Explosives Storage & Use Permit"
    : "Explosives Storage & Use Permit Applications";
  const data = isPermitTab
    ? explosivesPermits.filter(({ application_status }) => application_status === "APP")
    : explosivesPermits;

  return (
    <div>
      <br />
      <div className="inline-flex between">
        <h4 className="uppercase">{title}</h4>
        <AuthorizationWrapper permission={Permission.EDIT_EXPLOSIVES_PERMITS}>
          <AddButton onClick={(e) => handleOpenAddExplosivesPermitModal(e, isPermitTab)}>
            Add
            {' '}
            {title}
          </AddButton>
        </AuthorizationWrapper>
      </div>
      <br />
      <MineExplosivesPermitTable
        onExpand={onExpand}
        expandedRowKeys={expandedRowKeys}
        isLoaded
        data={data}
        isPermitTab={isPermitTab}
        handleOpenExplosivesPermitDecisionModal={handleOpenExplosivesPermitDecisionModal}
        handleOpenAddExplosivesPermitModal={handleOpenAddExplosivesPermitModal}
        handleOpenViewMagazineModal={handleOpenViewMagazineModal}
        explosivesPermitStatusOptionsHash={props.explosivesPermitStatusOptionsHash}
        explosivesPermitDocumentTypeOptionsHash={props.explosivesPermitDocumentTypeOptionsHash}
        handleOpenExplosivesPermitStatusModal={handleOpenExplosivesPermitStatusModal}
        handleDeleteExplosivesPermit={handleDeleteExplosivesPermit}
        handleOpenExplosivesPermitCloseModal={handleOpenExplosivesPermitCloseModal}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mines: getMines(state),
  inspectors: getDropdownInspectors(state),
  explosivesPermits: getExplosivesPermits(state),
  explosivesPermitStatusOptionsHash: getExplosivesPermitStatusOptionsHash(state),
  explosivesPermitDocumentTypeOptionsHash: getExplosivesPermitDocumentTypeOptionsHash(state),
  explosivesPermitDocumentTypeDropdownOptions:
    getExplosivesPermitDocumentTypeDropdownOptions(state),
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
