import React from "react";
import { Col, Divider, Row } from "antd";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import { formatDate } from "@/utils/helpers";

const propTypes = {
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const NoticeOfDepartureDetails = (props) => {
  const { noticeOfDeparture } = props;
  const {
    nod_title,
    permit,
    nod_guid,
    nod_description,
    nod_type,
    nod_status,
    documents,
    submission_timestamp,
  } = noticeOfDeparture;

  const checklist =
    documents.find((doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) ||
    {};

  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type !== NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const submitted = formatDate(submission_timestamp);

  return (
    <div>
      <div className="nod-section-padding">
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div>
          <p className="field-title">Departure Project Title</p>
          <p className="content--light-grey padding-sm">{nod_title || EMPTY_FIELD}</p>
        </div>
        <Row justify="space-between" gutter={24}>
          <Col span={12}>
            <p className="field-title">Permit #</p>
            <p className="content--light-grey padding-sm">{permit.permit_no || EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD #</p>
            <p className="content--light-grey padding-sm">{nod_guid || EMPTY_FIELD}</p>
          </Col>
        </Row>
        <div>
          <p className="field-title">Departure Summary</p>
          <p className="content--light-grey padding-sm">{nod_description || EMPTY_FIELD}</p>
        </div>
        <Divider className="nod-divider" />
        <Row justify="space-between" gutter={24}>
          <Col span={12}>
            <p className="field-title">Submitted</p>
            <p className="content--light-grey padding-sm">{submitted || EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">Status</p>
            <p className="content--light-grey padding-sm">
              {NOTICE_OF_DEPARTURE_STATUS[nod_status] || EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        <Row justify="left">
          <Col span={12}>
            <p className="field-title">Self Determination Type</p>
            <p className="content--light-grey padding-sm">
              {NOTICE_OF_DEPARTURE_TYPE[nod_type] || EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        <h4 className="nod-modal-section-header">Self-Assessment Form</h4>
        <Row justify="space-between">
          <Col span={16}>
            <p className="field-title">Uploaded File(s)</p>
            <p>{checklist.document_name || EMPTY_FIELD}</p>
          </Col>
          <Col span={5}>
            <p className="field-title">Upload Date</p>
            <p>{formatDate(checklist.create_timestamp) || EMPTY_FIELD}</p>
          </Col>
          <Col span={3}>
            <p className="field-title">&nbsp;</p>
            <p>
              {checklist.document_name ? (
                <LinkButton
                  onClick={() => downloadFileFromDocumentManager(checklist)}
                  title="Download"
                >
                  Download
                </LinkButton>
              ) : (
                <p>{EMPTY_FIELD}</p>
              )}
            </p>
          </Col>
        </Row>
        {otherDocuments.length > 0 && (
          <div>
            <h4 className="nod-modal-section-header">Application Documentation</h4>
            <Row>
              <Col span={16}>
                <p className="field-title">Uploaded File</p>
              </Col>
              <Col span={5}>
                <p className="field-title">Upload Date</p>
              </Col>
              <Col span={3}>
                <p className="field-title">&nbsp;</p>
              </Col>
            </Row>
            {otherDocuments.map((document) => (
              <Row>
                <Col span={16}>
                  <p>{document?.document_name || EMPTY_FIELD}</p>
                </Col>
                <Col span={5}>
                  <p>{formatDate(document?.create_timestamp) || EMPTY_FIELD}</p>
                </Col>
                <Col span={3}>
                  <LinkButton
                    onClick={() => downloadFileFromDocumentManager(document)}
                    title={document?.document_name}
                  >
                    Download
                  </LinkButton>
                </Col>
              </Row>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

NoticeOfDepartureDetails.propTypes = propTypes;

export default NoticeOfDepartureDetails;
