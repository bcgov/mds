import "@ant-design/compatible/assets/index.css";

import { Button, Col, Row, Table, Typography } from "antd";
import { IExplosivesPermit, IMine } from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import { formatDate } from "@common/utils/helpers";
import Magazine from "@/components/mine/ExplosivesPermit/Magazine";
import { bindActionCreators } from "redux";
import { openDocument } from "@/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { IExplosivesPermitDocument } from "@mds/common/interfaces/explosivesPermitMagazine.interface";

export const getGeneratedDocCategory = (doc: IExplosivesPermitDocument) => {
  switch (doc.explosives_permit_document_type_code) {
    case "LET":
      return "Permit Enclosed Letter";
    case "PER":
      return "Explosives Storage and Use Permit";
    default:
      return "";
  }
};

export const generatedDocColumns = [
  {
    title: "Category",
    dataIndex: "explosives_permit_document_type_code",
    key: "explosives_permit_document_type_code",
    render: (text, record) => <div title="Category">{getGeneratedDocCategory(record)}</div>,
  },
  {
    title: "File Name",
    dataIndex: "document_name",
    key: "document_name",
    render: (text, record) => <a onClick={() => downloadFileFromDocumentManager(record)}>{text}</a>,
  },
  {
    title: "Created",
    dataIndex: "upload_date",
    key: "upload_date",
    render: (text) => <div title="Date">{formatDate(text)}</div>,
  },
];

export const supportingDocColumns = [
  {
    title: "File Name",
    dataIndex: "document_name",
    key: "document_name",
    render: (text, record) => <a onClick={() => downloadFileFromDocumentManager(record)}>{text}</a>,
  },
  {
    title: "Created By",
    dataIndex: "create_user",
    key: "create_user",
    render: (text) => <div>{text}</div>,
  },
  {
    title: "Uploaded",
    dataIndex: "upload_date",
    key: "upload_date",
    render: (text) => <div>{formatDate(text)}</div>,
  },
];

interface ExplosivesPermitViewModalProps {
  explosivesPermit: IExplosivesPermit;
  mine: IMine;
  title: string;
  closeModal: () => void;
  openDocument: (document_manager_guid: string, mine_document_guid: string) => void;
}

export const ExplosivesPermitViewModal: FC<ExplosivesPermitViewModalProps> = (props) => {
  const { explosivesPermit, mine, title } = props;

  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);

  useEffect(() => {
    if (explosivesPermit) {
      const generatedTypes = ["LET", "PER"];
      setGeneratedDocs(
        explosivesPermit.documents.filter((doc) =>
          generatedTypes.includes(doc.explosives_permit_document_type_code)
        )
      );
      setSupportingDocs(
        explosivesPermit.documents.filter(
          (doc) => !generatedTypes.includes(doc.explosives_permit_document_type_code)
        )
      );
    }
  }, [explosivesPermit]);

  return (
    <div>
      <Typography.Title level={3} className="margin-large--bottom">
        Explosive Storage and Use Permit
      </Typography.Title>
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Typography.Title level={4} className="purple">
            Explosives Permit Details
          </Typography.Title>
          <Typography.Paragraph>
            Select the location and one or more incident types for this submission.
          </Typography.Paragraph>
          <>
            <Row gutter={6}>
              <Col span={12}>
                <Typography.Paragraph strong>Issue Date</Typography.Paragraph>
                <Typography.Paragraph>{explosivesPermit.issue_date}</Typography.Paragraph>
              </Col>
              <Col span={12}>
                <Typography.Paragraph strong>Expiry Date</Typography.Paragraph>
                <Typography.Paragraph>{explosivesPermit.expiry_date}</Typography.Paragraph>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col span={24}>
                <Typography.Paragraph strong>Issuing Inspector</Typography.Paragraph>
                <Typography.Paragraph>
                  {explosivesPermit.issuing_inspector_name}
                </Typography.Paragraph>
              </Col>
            </Row>
          </>

          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Explosives Permit Number</Typography.Paragraph>
              <Typography.Paragraph>{explosivesPermit.permit_number}</Typography.Paragraph>
            </Col>

            <Col span={12}>
              <Typography.Paragraph strong>Mines Act Permit</Typography.Paragraph>
              <Typography.Paragraph>example</Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Notice of Work Number</Typography.Paragraph>
          <Typography.Paragraph>{explosivesPermit.now_number}</Typography.Paragraph>
          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Mine Manager</Typography.Paragraph>
              <Typography.Paragraph>
                {explosivesPermit.mine_manager_mine_party_appt_id}
              </Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Permittee</Typography.Paragraph>
              <Typography.Paragraph>
                {explosivesPermit.permittee_mine_party_appt_id}
              </Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Application Date</Typography.Paragraph>
          <Typography.Paragraph>{explosivesPermit.application_date}</Typography.Paragraph>
          <Typography.Paragraph strong>Other Information</Typography.Paragraph>
          <Typography.Paragraph>{explosivesPermit.description}</Typography.Paragraph>
          <Typography.Title level={4} className="purple">
            Storage Details
          </Typography.Title>
          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Latitude</Typography.Paragraph>
              <Typography.Paragraph>{explosivesPermit?.latitude}</Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Longitude</Typography.Paragraph>
              <Typography.Paragraph>{explosivesPermit?.longitude}</Typography.Paragraph>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[explosivesPermit.latitude, explosivesPermit.longitude]} />
          <br />
          {supportingDocs.length > 0 && (
            <Row>
              <Typography.Title level={4} className="purple">
                Supporting Documents
              </Typography.Title>
              <Typography.Paragraph strong>Permit Documents</Typography.Paragraph>
              <Typography.Paragraph>
                These documents were generated when this version of the permit was created. These
                documents will be viewable by Minespace users
              </Typography.Paragraph>
              <Table dataSource={generatedDocs} pagination={false} columns={generatedDocColumns} />
              <Typography.Paragraph strong>Uploaded Documents</Typography.Paragraph>
              <Typography.Paragraph>
                Documents uploaded here will be viewable by Minespace users
              </Typography.Paragraph>
              <Table
                dataSource={supportingDocs}
                pagination={false}
                columns={supportingDocColumns}
              />
            </Row>
          )}
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <>
            <Typography.Title level={4} className="purple">
              Permit Status
            </Typography.Title>
            <Row>
              <Col span={explosivesPermit.is_closed ? 12 : 24}>
                <Typography.Paragraph strong className="margin-none">
                  Permit Status
                </Typography.Paragraph>
              </Col>
              {explosivesPermit.is_closed && (
                <Col span={12}>
                  <Typography.Paragraph strong className="margin-none">
                    Date Closed
                  </Typography.Paragraph>
                </Col>
              )}
            </Row>
            <Row align="middle" justify="space-between">
              <Col span={explosivesPermit.is_closed ? 12 : 8}>
                <Typography.Paragraph className="margin-none">
                  {explosivesPermit.is_closed ? "Closed" : "Open"}
                </Typography.Paragraph>
              </Col>
              <Col span={explosivesPermit.is_closed ? 12 : 16}>
                {explosivesPermit.is_closed ? (
                  <Typography.Paragraph className="margin-none">
                    {formatDate(explosivesPermit.closed_timestamp)}
                  </Typography.Paragraph>
                ) : (
                  <Button type="ghost" className="close-permit-button">
                    Close Permit
                  </Button>
                )}
              </Col>
            </Row>
            {explosivesPermit.is_closed && (
              <Row className="margin-large--top">
                <Col span={24}>
                  <Typography.Paragraph>Reason for Closure</Typography.Paragraph>
                </Col>
                <Col span={24}>
                  <Typography.Paragraph>{explosivesPermit.closed_reason}</Typography.Paragraph>
                </Col>
              </Row>
            )}
            <Typography.Title level={4} className="purple margin-large--top">
              Explosives Magazines
            </Typography.Title>
            {explosivesPermit?.explosive_magazines?.length > 0 &&
              explosivesPermit.explosive_magazines.map((magazine, index) => (
                <Magazine
                  key={magazine.explosives_permit_magazine_id}
                  label={`Explosives Magazine ${index + 1}`}
                  magazine={magazine}
                />
              ))}
            <Typography.Title level={4} className="purple">
              Detonator Magazines
            </Typography.Title>
            {explosivesPermit?.detonator_magazines?.length > 0 &&
              explosivesPermit.detonator_magazines.map((magazine, index) => (
                <Magazine
                  key={magazine.explosives_permit_magazine_id}
                  label={`Detonator Magazine ${index + 1}`}
                  magazine={magazine}
                />
              ))}
            <Typography.Title level={4} className="purple">
              Permit History
            </Typography.Title>
          </>
        </Col>
      </Row>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Button onClick={props.closeModal} className="full-mobile">
          Close
        </Button>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ExplosivesPermitViewModal);
