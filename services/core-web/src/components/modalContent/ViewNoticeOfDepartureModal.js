import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Row } from "antd";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
} from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import { TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/buttons/LinkButton";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDate } from "@common/utils/helpers";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const ViewNoticeOfDepartureModal = (props) => {
  const { noticeOfDeparture } = props;
  const checklist = noticeOfDeparture.documents.find(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );
  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type !== NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const fileColumns = [
    {
      title: "Name",
      dataIndex: "document_name",
      sortField: "document_name",
      sorter: (a, b) => (a.document_name > b.document_name ? -1 : 1),
      render: (text) => (
        <div className="nod-table-link">
          {text ? (
            <LinkButton onClick={() => downloadFileFromDocumentManager(checklist)} title="Download">
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
      sorter: (a, b) => (a.document_category > b.document_category ? -1 : 1),
      render: (text) => <div title="Id">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "Uploaded",
      dataIndex: "create_timestamp",
      sortField: "create_timestamp",
      sorter: (a, b) => (a.create_timestamp > b.create_timestamp ? -1 : 1),
      render: (text) => <div title="Type">{formatDate(text) || EMPTY_FIELD}</div>,
    },
    {
      dataIndex: "actions",
      render: () => (
        <div className="btn--middle flex">
          <button type="button" onClick={() => {}}>
            <img name="remove" src={TRASHCAN} alt="Remove Document" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div>
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
              <p>{noticeOfDeparture.nod_guid || EMPTY_FIELD}</p>
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
        <h4 className="nod-modal-section-header padding-md--top">Self-Assessment Form</h4>
        <CoreTable
          condition
          columns={fileColumns}
          dataSource={[checklist]}
          tableProps={{ pagination: false }}
        />
        <h4 className="nod-modal-section-header padding-md--top">Application Documentation</h4>
        <CoreTable
          condition
          columns={fileColumns}
          dataSource={otherDocuments}
          tableProps={{ pagination: false }}
        />
        <Row justify="space-between" className="padding-md--top" gutter={24}>
          <Col span={12}>
            <p className="field-title">Technical Operations Director</p>
            <p className="content--light-grey padding-md">{EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD Review Status</p>
            <p className="content--light-grey padding-md">
              {NOTICE_OF_DEPARTURE_STATUS[noticeOfDeparture.nod_status] || EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        <Row justify="space-between" className="padding-md--top">
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Created By</p>
              <p>{noticeOfDeparture.created_by || EMPTY_FIELD}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Updated By</p>
              <p>{noticeOfDeparture.updated_by || EMPTY_FIELD}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Updated Date</p>
              <p>{formatDate(noticeOfDeparture.update_timestamp) || EMPTY_FIELD}</p>
            </div>
          </Col>
        </Row>
      </div>

      <div className="right center-mobile">
        <Button
          className="full-mobile nod-cancel-button"
          type="secondary"
          onClick={props.closeModal}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

ViewNoticeOfDepartureModal.propTypes = propTypes;

export default ViewNoticeOfDepartureModal;
