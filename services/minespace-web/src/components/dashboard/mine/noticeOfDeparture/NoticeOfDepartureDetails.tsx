import React from "react";
import { Col, Divider, Row, Typography } from "antd";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import { formatDate } from "@/utils/helpers";
import NoticeOfDepartureCallout from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureCallout";
import {
  INoDDocument,
  INodDocument,
  INodDocumentPayload,
  INoticeOfDeparture,
  NodStatusSaveEnum,
} from "@mds/common";

interface NoticeOfDepartureDetailsProps {
  noticeOfDeparture: INoticeOfDeparture;
}

export const documentSection = ({
  documentArray,
  title,
}: {
  documentArray: INodDocument[];
  title: string;
}) => {
  return (
    <div>
      <h4 className="nod-modal-section-header">{title}</h4>
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
      {documentArray.map((document) => (
        <Row key={document.document_manager_guid}>
          <Col span={16}>
            <p>{document?.document_name || EMPTY_FIELD}</p>
          </Col>
          <Col span={5}>
            <p>{formatDate(document?.create_timestamp) || EMPTY_FIELD}</p>
          </Col>
          <Col span={3}>
            {document?.document_name ? (
              <LinkButton onClick={() => downloadFileFromDocumentManager(document)}>
                Download
              </LinkButton>
            ) : (
              <p>{EMPTY_FIELD}</p>
            )}
          </Col>
        </Row>
      ))}
    </div>
  );
};

export const NoticeOfDepartureDetails: React.FC<NoticeOfDepartureDetailsProps> = (props) => {
  const { noticeOfDeparture } = props;
  const {
    nod_title,
    permit,
    nod_no,
    nod_description,
    nod_type,
    nod_status,
    documents,
    submission_timestamp,
    nod_contacts,
  } = noticeOfDeparture;

  const checklist =
    documents.find((doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) ||
    ({} as INoDDocument);
  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER
  );
  const decision = documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.DECISION
  );

  const submitted = formatDate(submission_timestamp);

  return (
    <div>
      <div className="nod-section-padding">
        <NoticeOfDepartureCallout nodStatus={nod_status as NodStatusSaveEnum} />
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
            <p className="content--light-grey padding-sm">{nod_no || EMPTY_FIELD}</p>
          </Col>
        </Row>
        <div>
          <p className="field-title">Departure Summary</p>
          <p className="content--light-grey padding-sm">{nod_description || EMPTY_FIELD}</p>
        </div>
        {nod_contacts.length > 0 && (
          <div className="margin-large--bottom">
            <Typography.Title level={5} className="nod-modal-section-header">
              Primary Contact
            </Typography.Title>
            {nod_contacts.map((contact) => (
              <Row gutter={16} key={contact.nod_contact_guid}>
                <Col span={12}>
                  <p className="field-title">First Name</p>
                  <p className="content--light-grey padding-sm">
                    {contact.first_name || EMPTY_FIELD}
                  </p>
                </Col>
                <Col span={12}>
                  <p className="field-title">Last Name</p>
                  <p className="content--light-grey padding-sm">
                    {contact.last_name || EMPTY_FIELD}
                  </p>
                </Col>
                <Col span={12}>
                  <p className="field-title">Phone</p>
                  <p className="content--light-grey padding-sm">
                    {contact.phone_number || EMPTY_FIELD}
                  </p>
                </Col>
                <Col span={12}>
                  <p className="field-title">Email</p>
                  <p className="content--light-grey padding-sm">{contact.email || EMPTY_FIELD}</p>
                </Col>
              </Row>
            ))}
          </div>
        )}
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
        <Row justify="start">
          <Col span={12}>
            <p className="field-title">Self Determination Type</p>
            <p className="content--light-grey padding-sm">
              {NOTICE_OF_DEPARTURE_TYPE[nod_type] || EMPTY_FIELD}
            </p>
          </Col>
        </Row>
        {documentSection({ documentArray: [checklist], title: "Self-Assessment Form" })}
        {otherDocuments.length > 0 &&
          documentSection({ documentArray: otherDocuments, title: "Other Documents" })}
        {decision.length > 0 &&
          documentSection({
            documentArray: decision,
            title: "Ministry Decision Documentation",
          })}
      </div>
    </div>
  );
};

export default NoticeOfDepartureDetails;
