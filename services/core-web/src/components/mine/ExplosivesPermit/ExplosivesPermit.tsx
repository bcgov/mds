import React, { FC } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  createExplosivesPermit,
  deleteExplosivesPermit,
  fetchExplosivesPermits,
  updateExplosivesPermit,
} from "@mds/common/redux/actionCreators/explosivesPermitActionCreator";
import {
  createExplosivesPermitAmendment,
  updateExplosivesPermitAmendment,
} from "@mds/common/redux/actionCreators/explosivesPermitAmendmentActionCreator";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import {
  getExplosivesPermitDocumentTypeDropdownOptions,
  getExplosivesPermitDocumentTypeOptionsHash,
  getExplosivesPermitStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getMineGuid, getMines } from "@mds/common/redux/selectors/mineSelectors";
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
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { Feature, IExplosivesPermit, IGroupedDropdownList, IMine, IOption } from "@mds/common";
import { EsupFormMode } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFormNew";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";

interface IExplosivesPermitAmendmentData {
  amendment_count?: number;
  explosives_permit_amendment_guid?: string;
}
interface ExplosivesPermitProps {
  isPermitTab: boolean;
  mineGuid: string;
  inspectors: IGroupedDropdownList[];
  updateExplosivesPermit: ActionCreator<typeof updateExplosivesPermit>;
  createExplosivesPermit: ActionCreator<typeof createExplosivesPermit>;
  createExplosivesPermitAmendment: ActionCreator<typeof createExplosivesPermitAmendment>;
  updateExplosivesPermitAmendment: ActionCreator<typeof updateExplosivesPermitAmendment>;
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
  updateExplosivesPermit,
  updateExplosivesPermitAmendment,
  fetchExplosivesPermits,
  closeModal,
  ...props
}) => {
  const { isFeatureEnabled } = useFeatureFlag();

  const getAmendmentData = (record) => {
    const result: IExplosivesPermitAmendmentData = {};
    if (record.explosives_permit_amendments && record.explosives_permit_amendments.length > 1) {
      result.amendment_count = record.explosives_permit_amendments.length - 1;
      result.explosives_permit_amendment_guid =
        record.explosives_permit_amendments[0].explosives_permit_amendment_guid;
    }
    return result;
  };

  //find out if given record is an amendment
  const isEsupAmendment = (record) => {
    if (record?.explosives_permit_amendment_id) {
      return true;
    } else {
      return false;
    }
  };

  const handleIssueExplosivesPermit = async (values, record) => {
    const amendmentData = getAmendmentData(record);
    const { explosives_permit_amendment_guid, amendment_count } = amendmentData;

    const updatedValues = explosives_permit_amendment_guid
      ? { ...values, ...amendmentData }
      : values;

    const payload = { ...record, ...updatedValues, application_status: "APP" };

    if (amendment_count) {
      await updateExplosivesPermitAmendment(payload, true);
    } else {
      await updateExplosivesPermit(payload, true);
    }

    fetchExplosivesPermits(mineGuid);
    closeModal();
  };

  const handleDocumentPreview = (documentTypeCode, values: any, record) => {
    const amendmentData = getAmendmentData(record);
    if (amendmentData.amendment_count) {
      values = { ...values, ...amendmentData };
    }
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

  const handleOpenExplosivesPermitDecisionModal = (event, record: IExplosivesPermit) => {
    event?.preventDefault();
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

  const handleUpdateExplosivesPermit = (values, isAmendment = false, issuePermitAfter = false) => {
    const payload = {
      ...values,
    };
    const updateEsup = isAmendment ? updateExplosivesPermitAmendment : updateExplosivesPermit;

    updateEsup(payload).then((permitData) => {
      fetchExplosivesPermits(mineGuid);
      if (issuePermitAfter) {
        handleOpenExplosivesPermitDecisionModal(event, permitData.data);
      } else {
        closeModal();
      }
    });
  };

  const handleAddExplosivesPermit = (values) => {
    const system = values.is_historic ? "MMS" : "Core";
    const payload = {
      originating_system: system,
      ...values,
    };
    return props.createExplosivesPermit(mineGuid, payload).then((newPermit) => {
      fetchExplosivesPermits(mineGuid);
      if (system === "Core") {
        handleOpenExplosivesPermitDecisionModal(null, newPermit.data);
      } else {
        closeModal();
      }
    });
  };

  const handleCreateNewAmendment = (values, issueAfter = true) => {
    return props.createExplosivesPermitAmendment(values).then((newPermit) => {
      fetchExplosivesPermits(mineGuid);
      if (issueAfter) {
        handleOpenExplosivesPermitDecisionModal({ preventDefault: () => null }, newPermit.data);
      } else {
        closeModal();
      }
    });
  };

  const handleOpenAddExplosivesPermitModal = (event, permitTab, record = null) => {
    const initialValues = record || {};
    const hasAmendments = record?.explosives_permit_amendments?.length > 1;
    const isProcessed = record !== null && record?.application_status !== "REC";
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: (values) => {
          // after feature flag removed, this will ONLY be used for new records and can be simplified. ("Add" button on table)
          return record && !isFeatureEnabled(Feature.ESUP_PERMIT_AMENDMENT)
            ? handleUpdateExplosivesPermit(values, hasAmendments)
            : handleAddExplosivesPermit(values);
        },
        title: "Add Permit",
        initialValues,
        documents: record?.documents ?? [],
        formMode: EsupFormMode.select_type_modal,
        mineGuid,
        isProcessed,
        documentTypeDropdownOptions: explosivesPermitDocumentTypeDropdownOptions,
        isPermitTab: permitTab,
        inspectors,
        isAmendment: !!record?.explosives_permit_amendment_guid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  };

  const getAmendmentDocuments = (record) => {
    // Get all documents for the parent permit and all amendments
    const parentPermit = explosivesPermits.find(
      ({ explosives_permit_id }) => explosives_permit_id === record.explosives_permit_id
    );
    return [
      ...parentPermit.documents,
      ...parentPermit?.explosives_permit_amendments?.map((amendment) => amendment.documents),
    ].flat();
  };

  const handleOpenEditExplosivesPermitModal = (event, record = null, actionKey) => {
    const documentsOnly = actionKey === "edit_documents";
    const initialValues = record || {};
    const isAmendment = isEsupAmendment(record);
    const isProcessed = record !== null && record?.application_status !== "REC";

    let modalTitle = "Add Permit";
    let formMode = EsupFormMode.create_new;
    let documents = record?.documents ?? [];

    if (documentsOnly) {
      modalTitle = "Add Documents to Permits";
      formMode = EsupFormMode.edit_document;
    } else {
      if (isAmendment) {
        modalTitle = "Amend Explosives Storage and Use Permit";
        formMode = EsupFormMode.amend;
        documents = getAmendmentDocuments(record);
      }
    }
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: (values) => handleUpdateExplosivesPermit(values, isAmendment, !documentsOnly),
        title: modalTitle,
        initialValues,
        documents: documents,
        mineGuid,
        formMode,
        isProcessed,
        documentTypeDropdownOptions: explosivesPermitDocumentTypeDropdownOptions,
        inspectors,
        // isAmendment: !!record?.explosives_permit_amendment_guid,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  };

  const handleOpenAmendExplosivesPermitModal = (event, record: IExplosivesPermit = null) => {
    event.preventDefault();

    const allDocs = getAmendmentDocuments(record);
    props.openModal({
      props: {
        title: "Amend Explosives Storage and Use Permit",
        onSubmit: (values) => handleCreateNewAmendment(values),
        initialValues: record,
        documents: allDocs,
        formMode: EsupFormMode.amend,
        isAmendment: true,
        mineGuid,
        isProcessed: false,
        documentTypeDropdownOptions: explosivesPermitDocumentTypeDropdownOptions,
        isPermitTab: true,
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
    let initialValues = record || {};
    event.preventDefault();
    if (Object.keys(initialValues).length > 0) {
      initialValues = { ...initialValues, is_closed: true };
    }
    props.openModal({
      props: {
        onSubmit: handleUpdateExplosivesPermit,
        title: "Close Permit",
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
    const parentPermit = explosivesPermits.find(
      ({ explosives_permit_id }) => explosives_permit_id === record.explosives_permit_id
    );
    props.openModal({
      props: {
        title: "View Explosives Storage & Use Permit",
        explosivesPermit: record,
        parentPermit: { explosives_permit_amendments: [], ...parentPermit },
        openAmendModal: handleOpenAmendExplosivesPermitModal,
        closeModal: closeModal,
        handleOpenExplosivesPermitCloseModal,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_VIEW_MODAL,
      isViewOnly: true,
      width: "75vw",
    });
  };

  const handleDeleteExplosivesPermit = (event, record) => {
    event.preventDefault();
    return props.deleteExplosivesPermit(mineGuid, record.explosives_permit_guid).then(() => {
      fetchExplosivesPermits(mineGuid);
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
        handleOpenEditExplosivesPermitModal={handleOpenEditExplosivesPermitModal}
        handleOpenViewMagazineModal={handleOpenViewMagazineModal}
        handleOpenViewExplosivesPermitModal={handleOpenViewExplosivesPermitModal}
        explosivesPermitStatusOptionsHash={props.explosivesPermitStatusOptionsHash}
        explosivesPermitDocumentTypeOptionsHash={props.explosivesPermitDocumentTypeOptionsHash}
        handleOpenExplosivesPermitStatusModal={handleOpenExplosivesPermitStatusModal}
        handleDeleteExplosivesPermit={handleDeleteExplosivesPermit}
        handleOpenAmendExplosivesPermitModal={handleOpenAmendExplosivesPermitModal}
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
      createExplosivesPermitAmendment,
      updateExplosivesPermit,
      updateExplosivesPermitAmendment,
      fetchExplosivesPermitDocumentContextTemplate,
      generateExplosivesPermitDocument,
      deleteExplosivesPermit,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
