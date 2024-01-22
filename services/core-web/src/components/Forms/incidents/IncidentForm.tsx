import React, { FC, useState } from "react";
import { useParams, withRouter } from "react-router-dom";
import { compose } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { change, formValueSelector, getFormValues, InjectedFormProps, reduxForm } from "redux-form";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Form, Row } from "antd";
import { IMineIncident } from "@mds/common";
import { getDropdownInspectors } from "@mds/common/redux/selectors/partiesSelectors";
import {
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentFollowupActionOptions,
  getDropdownIncidentStatusCodeOptions,
  getIncidentStatusCodeHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import {
  documentNameColumn,
  uploadDateColumn,
  uploadedByColumn,
} from "@/components/common/DocumentColumns";
import IncidentFormDocuments from "@/components/Forms/incidents/IncidentFormDocuments";
import IncidentFormInternalDocumentComments from "@/components/Forms/incidents/IncidentFormInternalDocumentComments";
import IncidentFormInitialReport from "@/components/Forms/incidents/IncidentFormInitialReport";

import IncidentFormUpdateIncidentStatus from "@/components/Forms/incidents/IncidentFormUpdateIncidentStatus";
import IncidentFormMinistryFollowup from "@/components/Forms/incidents/IncidentFormMinistryFollowup";
import { removeDocumentFromMineIncident } from "@mds/common/redux/actionCreators/incidentActionCreator";

export const INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD = "initial_incident_documents";
export const FINAL_REPORT_DOCUMENTS_FORM_FIELD = "final_report_documents";
export const INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD = "internal_ministry_documents";

export const documentColumns = [documentNameColumn(), uploadDateColumn(), uploadedByColumn()];

export const formatDocumentRecords = (documents) =>
  documents?.map((doc) => ({ ...doc, key: doc.mine_document_guid }));

interface IncidentFormProps {
  initialValues: IMineIncident;
  isEditMode: boolean;
  isNewIncident: boolean;
  incident: IMineIncident;
  handlers: {
    handleSaveData: () => void;
    handleFetchData: () => void;
  };
}

export const IncidentForm: FC<IncidentFormProps & InjectedFormProps> = (props) => {
  const { mineIncidentGuid, mineGuid } = useParams<{
    mineGuid: string;
    mineIncidentGuid: string;
  }>();

  const { isEditMode, handlers: parentHandlers } = props;
  const isNewIncident = Boolean(!mineIncidentGuid);

  const dispatch = useDispatch();

  const incidentDeterminationOptions = useSelector(getDropdownIncidentDeterminationOptions);
  const incidentStatusCodeHash = useSelector(getIncidentStatusCodeHash);
  const dangerousOccurenceSubparagraphOptions = useSelector(
    getDangerousOccurrenceSubparagraphOptions
  );
  const incidentFollowUpActionOptions = useSelector(getDropdownIncidentFollowupActionOptions);
  const inspectorOptions = useSelector(getDropdownInspectors) || [];
  const selector = formValueSelector(FORM.ADD_EDIT_INCIDENT);
  const documents = useSelector((state) => selector(state, "documents")) || [];
  const formValues = useSelector((state) => getFormValues(FORM.ADD_EDIT_INCIDENT)(state)) || {};
  const dropdownIncidentStatusCodeOptions = useSelector(getDropdownIncidentStatusCodeOptions);
  const isPristine = useSelector((state) => state.form[FORM.ADD_EDIT_INCIDENT]?.pristine);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onFileLoad = (fileName, document_manager_guid, documentTypeCode, documentFormField) => {
    const updatedUploadedFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
        mine_incident_document_type_code: documentTypeCode,
      },
    ];
    setUploadedFiles(updatedUploadedFiles);
    dispatch(change(FORM.ADD_EDIT_INCIDENT, documentFormField, updatedUploadedFiles));
  };

  const onRemoveFile = (err, fileItem, documentFormField) => {
    const updatedUploadedFiles = uploadedFiles.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(updatedUploadedFiles);
    return dispatch(change(FORM.ADD_EDIT_INCIDENT, documentFormField, updatedUploadedFiles));
  };

  const handleDeleteDocument = (event, mineDocumentGuid: string) => {
    if (mineGuid && props.incident.mine_incident_guid && mineDocumentGuid) {
      return dispatch(
        removeDocumentFromMineIncident(
          mineGuid,
          props.incident.mine_incident_guid,
          mineDocumentGuid
        )
      ).then(() => props.handlers.handleFetchData());
    }
    return null;
  };

  const renderEditSaveControls = () => {
    return (
      <div className="right center-mobile violet">
        {isEditMode && (
          <Button
            id="mine-incident-submit"
            className="full-mobile right"
            type="primary"
            htmlType="submit"
            loading={props.submitting}
            disabled={props.submitting}
          >
            {isNewIncident ? "Create Incident" : "Save Changes"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Form layout="vertical" onFinish={props.handleSubmit(parentHandlers.handleSaveData)}>
      <Col span={24}>
        <IncidentFormUpdateIncidentStatus
          incident={props.incident}
          dropdownIncidentStatusCodeOptions={dropdownIncidentStatusCodeOptions}
          incidentStatusCodeHash={incidentStatusCodeHash}
          isEditMode={isEditMode}
          formValues={formValues}
          pristine={isPristine}
        />
      </Col>
      <Row>
        <Col span={24}>{renderEditSaveControls()}</Col>
        <Col span={16} offset={4}>
          <IncidentFormInitialReport
            incident={props.incident}
            isEditMode={isEditMode}
            inspectorOptions={inspectorOptions}
          />
          <br />
          <IncidentFormDocuments
            documents={documents}
            isEditMode={isEditMode}
            onFileLoad={onFileLoad}
            onDeleteDocument={handleDeleteDocument}
            onRemoveFile={onRemoveFile}
          />
          <br />
          <IncidentFormMinistryFollowup
            isEditMode={isEditMode}
            incidentDeterminationOptions={incidentDeterminationOptions}
            incidentFollowUpActionOptions={incidentFollowUpActionOptions}
            dangerousOccurenceSubparagraphOptions={dangerousOccurenceSubparagraphOptions}
            inspectorOptions={inspectorOptions}
          />
          <br />
          <IncidentFormInternalDocumentComments
            documents={documents}
            incident={props.incident}
            isEditMode={isEditMode}
            onFileLoad={onFileLoad}
            onDeleteDocument={handleDeleteDocument}
            formValues={formValues}
            onRemoveFile={onRemoveFile}
          />
        </Col>
        <Col span={24}>
          <br />
          {renderEditSaveControls()}
        </Col>
      </Row>
    </Form>
  );
};

export default compose(
  withRouter,
  reduxForm({
    form: FORM.ADD_EDIT_INCIDENT,
    enableReinitialize: true,
    touchOnBlur: true,
    touchOnChange: true,
    destroyOnUnmount: true,
  })
)(IncidentForm);
