import React, { useEffect, useState } from "react";
import { Button, Col, Popconfirm, Row, Form } from "antd";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@mds/common/constants/strings";
import { formatDate, normalizePhone } from "@mds/common/redux/utils/helpers";
import {
  addDocumentToNoticeOfDeparture,
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  removeFileFromDocumentManager,
  updateNoticeOfDeparture,
} from "@mds/common/redux/actionCreators/noticeOfDepartureActionCreator";
import { Field, FieldArray, change, getFormValues } from "@mds/common/components/forms/form";
import {
  email,
  maxLength,
  phoneNumber,
  required,
  requiredList,
} from "@mds/common/redux/utils/Validate";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";
import { renderConfig } from "@/components/common/config";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import { renderDocumentLinkColumn } from "@mds/common/components/documents/DocumentColumns";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { INoticeOfDeparture } from "@mds/common/interfaces";
import { USER_ROLES } from "@mds/common/constants/environment";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { getNoticeOfDeparture } from "@mds/common/redux/selectors/noticeOfDepartureSelectors";
import { getMatchingPartyRelationships } from "@mds/common/redux/slices/partiesSlice";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";


const NodContacts = ({ fields, disabled }) => {
  return (
    <div className="margin-large--bottom">
      {fields.length > 0 && (
        <p className="nod-modal-section-sub-header margin-large--top">Primary Contact</p>
      )}
      {fields.map((contact: string) => (
        <Row gutter={16} key={contact}>
          <Col span={12}>
            <Field
              label="First Name"
              id={`${contact}.first_name`}
              name={`${contact}.first_name`}
              placeholder="First Name"
              component={renderConfig.FIELD}
              required
              validate={[required, maxLength(200)]}
              disabled={disabled}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Last Name"
              id={`${contact}.last_name`}
              name={`${contact}.last_name`}
              placeholder="Last Name"
              component={renderConfig.FIELD}
              required
              validate={[required, maxLength(200)]}
              disabled={disabled}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Phone Number"
              name={`${contact}.phone_number`}
              id={`${contact}.phone_number`}
              placeholder="XXX-XXX-XXXX"
              component={renderConfig.FIELD}
              validate={[phoneNumber, maxLength(12), required]}
              normalize={normalizePhone}
              disabled={disabled}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Email"
              id={`${contact}.email`}
              name={`${contact}.email`}
              component={renderConfig.FIELD}
              placeholder="example@example.com"
              required
              validate={[email, required]}
              disabled={disabled}
            />
          </Col>
        </Row>
      ))}
    </div>
  );
};

const NoticeOfDepartureModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [statusOptions, setStatusOptions] = useState([]);
  const [documentArray, setDocumentArray] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const formName = FORM.NOTICE_OF_DEPARTURE_FORM;
  const formValues = useAppSelector(getFormValues(formName)) as INoticeOfDeparture;
  const noticeOfDeparture = useAppSelector(getNoticeOfDeparture)
  const currentStatus = formValues?.nod_status;
  const mineManagers = useAppSelector(getMatchingPartyRelationships(MinePartyAppointmentTypeCodeEnum.MMG));
  const currentMineManager = mineManagers?.filter((m) => m.status === 'active')?.[0];
  const { nod_guid, mine } = noticeOfDeparture;
  const hasEditPermission = useAppSelector(userHasRole(USER_ROLES.role_edit_permits));
  const disabled = !hasEditPermission;

  const checklist = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );
  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER
  );
  const decision = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.DECISION
  );

  const isDecisionDocRequired = (status) => {
    const requiredDocStatuses = [
      NOTICE_OF_DEPARTURE_STATUS_VALUES.determined_non_substantial,
      NOTICE_OF_DEPARTURE_STATUS_VALUES.determined_substantial,
    ];

    return requiredDocStatuses.includes(status) && decision.length === 0 && documentArray.length == 0;
  }

  const handleAddDocuments = (noticeOfDepartureGuid) => {
    documentArray.forEach((document) =>
      dispatch(addDocumentToNoticeOfDeparture(
        { noticeOfDepartureGuid },
        {
          document_type: document.document_type,
          document_name: document.document_name,
          document_manager_guid: document.document_manager_guid,
        }
      ))
    );
  };

  const onFileLoad = (documentName, document_manager_guid, documentType) => {
    setUploadedFiles([
      ...uploadedFiles,
      {
        documentType,
        documentName,
        document_manager_guid,
      },
    ]);
    setDocumentArray([
      ...documentArray,
      {
        document_type: documentType,
        document_name: documentName,
        document_manager_guid,
      },
    ]);
  };

  useEffect(() => {
    dispatch(change(formName, "uploadedFiles", documentArray));
  }, [documentArray]);

  const onRemoveFile = (_, fileItem) => {
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
    setUploading(false);
  };

  useEffect(() => {
    const statuses = (() => {
      const { self_authorized, ...coreStatuses } = NOTICE_OF_DEPARTURE_STATUS_VALUES;
      return Object.values(coreStatuses);
    })();

    setStatusOptions(
      statuses.map((status) => {
        return {
          value: status,
          label: NOTICE_OF_DEPARTURE_STATUS[status],
        };
      })
    );
  }, []);

  const handleDeleteANoticeOfDepartureDocument = async (document) => {
    await removeFileFromDocumentManager(document);

    await dispatch(fetchDetailedNoticeOfDeparture(nod_guid));
  };

  const updateNoticeOfDepartureSubmit = async (values) => {
    await dispatch(updateNoticeOfDeparture({ nodGuid: nod_guid }, values));
    if (documentArray.length > 0) {
      await handleAddDocuments(nod_guid);
    }
    await dispatch(fetchNoticesOfDeparture(mine.mine_guid));
    dispatch(closeModal());
  };

  const fileColumns = (isSortable: boolean) => {
    return [
      renderDocumentLinkColumn("document_name", "File Name", isSortable),
      renderTextColumn("document_category", "Category", isSortable, EMPTY_FIELD),
      renderDateColumn("create_timestamp", "Uploaded", isSortable, null, EMPTY_FIELD),
      ...(disabled
        ? []
        : [
          {
            key: "actions",
            render: (record) => (
              <div className="btn--middle flex">
                <Popconfirm
                  placement="topRight"
                  title="Are you sure you want to delete this file?"
                  onConfirm={() =>
                    handleDeleteANoticeOfDepartureDocument({
                      mine_guid: mine.mine_guid,
                      nod_guid,
                      ...record,
                    })
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <button type="button">
                    <img src={TRASHCAN} alt="Remove Document" />
                  </button>
                </Popconfirm>
              </div>
            ),
          },
        ]),
    ];
  };

  return (
    <div>
      <FormWrapper
        isModal
        name={FORM.NOTICE_OF_DEPARTURE_FORM}
        initialValues={noticeOfDeparture}
        reduxFormConfig={{
          touchOnBlur: false,
          forceUnregisterOnUnmount: true,
          enableReinitialize: true,
        }}
        onSubmit={updateNoticeOfDepartureSubmit}>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div className="content--light-grey nod-section-padding">
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Departure Project Title</p>
            <p>{noticeOfDeparture.nod_title || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Departure Summary</p>
            <p>{noticeOfDeparture.nod_description || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Permit #</p>
            <p>{noticeOfDeparture?.permit.permit_no || EMPTY_FIELD}</p>
          </div>
          <div>
            <div className="inline-flex padding-sm">
              <p className="field-title margin-large--right">NOD #</p>
              <p>{noticeOfDeparture.nod_no || EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-sm">
              <p className="field-title margin-large--right">Declared Type</p>
              <p>{NOTICE_OF_DEPARTURE_TYPE[noticeOfDeparture.nod_type] || EMPTY_FIELD}</p>
            </div>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Mine Manager</p>
            <p>{currentMineManager?.party?.name || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Submitted</p>
            <p>{formatDate(noticeOfDeparture.submission_timestamp) || EMPTY_FIELD}</p>
          </div>
        </div>
        <FieldArray
          name="nod_contacts"
          component={NodContacts}
          disabled={disabled}
        />
        <h4 className="nod-modal-section-header padding-md--top">Self-Assessment Form</h4>
        <CoreTable condition columns={fileColumns(false)} dataSource={checklist} />
        <h4 className="nod-modal-section-header padding-md--top">Application Documentation</h4>
        <CoreTable condition columns={fileColumns(true)} dataSource={otherDocuments} />
        {decision.length > 0 && (
          <div>
            <h4 className="nod-modal-section-header padding-md--top">
              Ministry Decision Documentation
            </h4>
            <CoreTable condition columns={fileColumns(false)} dataSource={decision} />
          </div>
        )}
        {!disabled && (
          <Form.Item>
            <div className="nod-modal-section-header padding-md--top">
              <h4 className="nod-modal-section-header padding-md--top">
                Upload Ministry Decision Documentation
              </h4>
              <Field
                id="fileUpload"
                name="fileUpload"
                component={FileUpload}
                addFileStart={() => setUploading(true)}
                onAbort={() => setUploading(false)}
                onProcessFiles={() => setUploading(false)}
                validate={isDecisionDocRequired(currentStatus) ? [requiredList] : []}
                required={isDecisionDocRequired(currentStatus)}
                uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(mine.mine_guid)}
                acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
                onFileLoad={(documentName, document_manager_guid) => {
                  onFileLoad(
                    documentName,
                    document_manager_guid,
                    NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.DECISION
                  );
                }}
                onRemoveFile={onRemoveFile}
                allowRevert
                allowMultiple
              />
            </div>
          </Form.Item>
        )}
        <Row justify="space-between" className="padding-md--top" gutter={24}>
          <Col span={12}>
            <p className="field-title">Updated Date</p>
            <p className="content--light-grey padding-md">
              {formatDate(noticeOfDeparture.update_timestamp) || EMPTY_FIELD}
            </p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD Review Status</p>
            <div>
              <Field
                id="nod_status"
                name="nod_status"
                component={renderConfig.SELECT}
                data={statusOptions}
                disabled={disabled}
              />
            </div>
          </Col>
        </Row>
        <div className="right center-mobile">
          {disabled ? (
            <Button
              className="full-mobile nod-cancel-button"
              type="primary"
              onClick={() => dispatch(closeModal())}
            >
              Close
            </Button>
          ) : (
            <>
              <RenderCancelButton />
              <RenderSubmitButton disabled={isDecisionDocRequired(currentStatus) || uploading} buttonText="Update" disableOnClean={false} />
            </>
          )}
        </div>
      </FormWrapper>
    </div>
  );
};


export default NoticeOfDepartureModal;