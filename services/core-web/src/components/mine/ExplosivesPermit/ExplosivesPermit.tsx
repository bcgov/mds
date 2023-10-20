import React, { FC } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  createExplosivesPermit,
  deleteExplosivesPermit,
  fetchExplosivesPermits,
  updateExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import {
  getExplosivesPermitDocumentTypeDropdownOptions,
  getExplosivesPermitDocumentTypeOptionsHash,
  getExplosivesPermitStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { closeModal, openModal } from "@common/actions/modalActions";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { getDocumentContextTemplate } from "@/reducers/documentReducer";
import {
  fetchExplosivesPermitDocumentContextTemplate,
  generateExplosivesPermitDocument,
} from "@/actionCreators/documentActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import { modalConfig } from "@/components/modalContent/config";
import { ActionCreator } from "@/interfaces/actionCreator";
import { IExplosivesPermit, IGroupedDropdownList, IMine, IOption } from "@mds/common";

interface ExplosivesPermitProps {
  isPermitTab: boolean;
  mineGuid: string;
  inspectors: IGroupedDropdownList[];
  updateExplosivesPermit: ActionCreator<typeof updateExplosivesPermit>;
  createExplosivesPermit: ActionCreator<typeof createExplosivesPermit>;
  openModal: (value: any) => void;
  closeModal: () => void;
  fetchExplosivesPermits: ActionCreator<typeof fetchExplosivesPermits>;
  deleteExplosivesPermit: ActionCreator<typeof deleteExplosivesPermit>;
  fetchExplosivesPermitDocumentContextTemplate: ActionCreator<
    typeof fetchExplosivesPermitDocumentContextTemplate
  >;
  generateExplosivesPermitDocument: ActionCreator<typeof generateExplosivesPermitDocument>;
  mines: IMine[];
  documentContextTemplate: any;
  explosivesPermits: IExplosivesPermit[];
  explosivesPermitStatusOptionsHash: any;
  explosivesPermitDocumentTypeDropdownOptions: IOption[];
  explosivesPermitDocumentTypeOptionsHash: any;
}

export const ExplosivesPermit: FC<ExplosivesPermitProps> = ({
  isPermitTab = false,
  mineGuid,
  mines,
  inspectors,
  explosivesPermits,
  explosivesPermitDocumentTypeDropdownOptions,
  ...props
}) => {
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
    const isProcessed = record !== null && record?.application_status !== "REC";
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: record ? handleUpdateExplosivesPermit : handleAddExplosivesPermit,
        title: "Add Permit",
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

  const handleOpenViewExplosivesPermitModal = (event, record) => {
    event.preventDefault();
    const mine = mines[mineGuid];
    const parentPermit = explosivesPermits.find(
      ({ explosives_permit_id }) => explosives_permit_id === record.explosives_permit_id
    );
    props.openModal({
      props: {
        title: "View Explosives Storage & Use Permit",
        explosivesPermit: record,
        parentPermit,
        mine,
        closeModal: props.closeModal,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_VIEW_MODAL,
      isViewOnly: true,
      width: "75vw",
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
    props
      .fetchExplosivesPermitDocumentContextTemplate("LET", record.explosives_permit_guid)
      .then((documentContextTemplate) => {
        const initialValues = {};
        documentContextTemplate.document_template.form_spec.forEach(
          (item) => (initialValues[item.id] = item["context-value"])
        );
        props.openModal({
          props: {
            initialValues,
            documentType: documentContextTemplate,
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
            Add {title}
          </AddButton>
        </AuthorizationWrapper>
      </div>
      <br />
      <MineExplosivesPermitTable
        isLoaded
        data={data}
        isPermitTab={isPermitTab}
        handleOpenExplosivesPermitDecisionModal={handleOpenExplosivesPermitDecisionModal}
        handleOpenAddExplosivesPermitModal={handleOpenAddExplosivesPermitModal}
        handleOpenViewMagazineModal={handleOpenViewMagazineModal}
        handleOpenViewExplosivesPermitModal={handleOpenViewExplosivesPermitModal}
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

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
