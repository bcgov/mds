import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Popconfirm, Row } from "antd";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@common/constants/strings";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDate, normalizePhone, resetForm } from "@common/utils/helpers";
import {
  addDocumentToNoticeOfDeparture,
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  removeFileFromDocumentManager,
  updateNoticeOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getNoticeOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { change, Field, FieldArray, reduxForm } from "redux-form";
import {
  email,
  maxLength,
  phoneNumber,
  required,
  validateSelectOptions,
} from "@common/utils/Validate";
import { USER_ROLES } from "@mds/common";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";
import LinkButton from "@/components/common/buttons/LinkButton";
import { renderConfig } from "@/components/common/config";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import * as Permission from "@/constants/permissions";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  closeModal: PropTypes.func.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
  fetchDetailedNoticeOfDeparture: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  updateNoticeOfDeparture: PropTypes.func.isRequired,
  addDocumentToNoticeOfDeparture: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const renderContactsPropTypes = {
  fields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export const renderContacts = (props, disabled = false) => {
  const { fields } = props;

  return (
    <div className="margin-large--bottom">
      {fields.length > 0 && (
        <p className="nod-modal-section-sub-header margin-large--top">Primary Contact</p>
      )}
      {fields.map((contact, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Row gutter={16} key={index}>
          <Col span={12}>
            <Form.Item label="First Name">
              <Field
                id={`${contact}.first_name`}
                name={`${contact}.first_name`}
                placeholder="First Name"
                component={renderConfig.FIELD}
                validate={[required, maxLength(200)]}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Last Name">
              <Field
                id={`${contact}.last_name`}
                name={`${contact}.last_name`}
                placeholder="Last Name"
                component={renderConfig.FIELD}
                validate={[required, maxLength(200)]}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone Number">
              <Field
                name={`${contact}.phone_number`}
                id={`${contact}.phone_number`}
                placeholder="XXX-XXX-XXXX"
                component={renderConfig.FIELD}
                validate={[phoneNumber, maxLength(12), required]}
                normalize={normalizePhone}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email">
              <Field
                id={`${contact}.email`}
                name={`${contact}.email`}
                component={renderConfig.FIELD}
                placeholder="example@example.com"
                validate={[email, required]}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        </Row>
      ))}
    </div>
  );
};

renderContacts.propTypes = renderContactsPropTypes;

const NoticeOfDepartureModal = (props) => {
  const [statusOptions, setStatusOptions] = React.useState([]);
  const [documentArray, setDocumentArray] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { noticeOfDeparture, mine, handleSubmit, pristine } = props;
  const { nod_guid } = noticeOfDeparture;

  const hasEditPermission = props.userRoles.includes(USER_ROLES[Permission.EDIT_PERMITS]);
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

  const handleAddDocuments = (noticeOfDepartureGuid) => {
    documentArray.forEach((document) =>
      props.addDocumentToNoticeOfDeparture(
        { mineGuid: mine.mine_guid, noticeOfDepartureGuid },
        {
          document_type: document.document_type,
          document_name: document.document_name,
          document_manager_guid: document.document_manager_guid,
        }
      )
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
    change("uploadedFiles", documentArray);
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

    await props.fetchDetailedNoticeOfDeparture(nod_guid);
  };

  const updateNoticeOfDepartureSubmit = async (values) => {
    await props.updateNoticeOfDeparture({ mineGuid: mine.mine_guid, nodGuid: nod_guid }, values);
    if (documentArray.length > 0) {
      await handleAddDocuments(nod_guid);
    }
    await props.fetchNoticesOfDeparture(mine.mine_guid);
    props.closeModal();
  };

  const fileColumns = (isSortable) => {
    return [
      {
        title: "Name",
        dataIndex: "document_name",
        sortField: "document_name",
        sorter: isSortable ? (a, b) => a.document_name.localeCompare(b.document_name) : false,
        render: (text, record) => (
          <div className="nod-table-link">
            {text ? (
              <LinkButton onClick={() => downloadFileFromDocumentManager(record)} title="Download">
                {text}
              </LinkButton>
            ) : (
              <div>{EMPTY_FIELD}</div>
            )}
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "document_category",
        sortField: "document_category",
        sorter: isSortable
          ? (a, b) => a.document_category.localeCompare(b.document_category)
          : false,
        render: (text) => <div title="Id">{text || EMPTY_FIELD}</div>,
      },
      {
        title: "Uploaded",
        dataIndex: "create_timestamp",
        sortField: "create_timestamp",
        sorter: isSortable ? (a, b) => a.create_timestamp.localeCompare(b.create_timestamp) : false,
        render: (text) => <div title="Type">{formatDate(text) || EMPTY_FIELD}</div>,
      },
      ...(disabled
        ? []
        : [
            {
              dataIndex: "actions",
              render: (text, record) => (
                <div className="btn--middle flex">
                  <Popconfirm
                    placement="topRight"
                    title="Are you sure you want to delete this file?"
                    onConfirm={() =>
                      handleDeleteANoticeOfDepartureDocument({
                        mine_guid: mine.mine_guid,
                        nod_guid,
                        ...record,
                      })}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button type="button">
                      <img name="remove" src={TRASHCAN} alt="Remove Document" />
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
      <Form layout="vertical" onSubmit={handleSubmit(updateNoticeOfDepartureSubmit)}>
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
            <p>{formatDate(noticeOfDeparture.mine_manager_name) || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Submitted</p>
            <p>{formatDate(noticeOfDeparture.submission_timestamp) || EMPTY_FIELD}</p>
          </div>
        </div>
        <FieldArray
          name="nod_contacts"
          component={(componentProps) => renderContacts(componentProps, disabled)}
        />
        <h4 className="nod-modal-section-header padding-md--top">Self-Assessment Form</h4>
        <CoreTable
          condition
          columns={fileColumns(false)}
          dataSource={checklist}
          tableProps={{ pagination: false }}
        />
        <h4 className="nod-modal-section-header padding-md--top">Application Documentation</h4>
        <CoreTable
          condition
          columns={fileColumns(true)}
          dataSource={otherDocuments}
          tableProps={{ pagination: false }}
        />
        {decision.length > 0 && (
          <div>
            <h4 className="nod-modal-section-header padding-md--top">
              Ministry Decision Documentation
            </h4>
            <CoreTable
              condition
              columns={fileColumns(false)}
              dataSource={decision}
              tableProps={{ pagination: false }}
            />
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
              <Form.Item>
                <Field
                  id="nod_status"
                  name="nod_status"
                  validate={[validateSelectOptions(statusOptions)]}
                  component={renderConfig.SELECT}
                  data={statusOptions}
                  disabled={disabled}
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <div className="right center-mobile">
          {disabled ? (
            <Button
              className="full-mobile nod-cancel-button"
              type="primary"
              onClick={props.closeModal}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                className="full-mobile nod-update-button"
                type="primary"
                htmlType="submit"
                onClick={handleSubmit(updateNoticeOfDepartureSubmit)}
                disabled={(pristine && documentArray.length === 0) || uploading}
              >
                Update
              </Button>
              <Popconfirm
                placement="top"
                title="Are you sure you want to cancel?"
                okText="Yes"
                cancelText="No"
                onConfirm={props.closeModal}
              >
                <Button className="full-mobile nod-cancel-button" type="secondary">
                  Cancel
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

NoticeOfDepartureModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  noticeOfDeparture: getNoticeOfDeparture(state),
  initialValues: getNoticeOfDeparture(state),
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchDetailedNoticeOfDeparture,
      updateNoticeOfDeparture,
      fetchNoticesOfDeparture,
      addDocumentToNoticeOfDeparture,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.NOTICE_OF_DEPARTURE_FORM,
    onSubmitSuccess: resetForm(FORM.NOTICE_OF_DEPARTURE_FORM),
    touchOnBlur: false,
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
  })
)(NoticeOfDepartureModal);
