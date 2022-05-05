import React from "react";
import { Col, Divider, Row } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { NOTICE_OF_DEPARTURE_DOCUMENT_TYPE } from "../../../../../common/constants/strings";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import { downloadFileFromDocumentManager } from "../../../../../common/utils/actionlessNetworkCalls";
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
  const checklist = documents.find(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
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
            <p className="field-title">Mine Manager</p>
            <p className="content--light-grey padding-sm">{EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">Ministry Contact</p>
            <p className="content--light-grey padding-sm">{EMPTY_FIELD}</p>
          </Col>
        </Row>
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
            <p>{checklist.document_name}</p>
          </Col>
          <Col>
            <p className="field-title">Upload Date</p>
            <p>{checklist.upload_date || EMPTY_FIELD}</p>
          </Col>
          <Col>
            <p>&nbsp;</p>
            <p>
              <LinkButton
                onClick={() => downloadFileFromDocumentManager(checklist)}
                title="Download"
              >
                Download
              </LinkButton>
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
};

NoticeOfDepartureDetails.propTypes = propTypes;

export default NoticeOfDepartureDetails;
