import "@ant-design/compatible/assets/index.css";

import { Alert, Button, Col, Row, Table, Typography } from "antd";
import {
  IExplosivesPermit,
  IExplosivesPermitAmendment,
  IExplosivesPermitDocument,
  IMine,
} from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import { formatDate } from "@common/utils/helpers";
import Magazine from "@/components/mine/ExplosivesPermit/Magazine";
import { bindActionCreators } from "redux";
import { openDocument } from "@/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import ExplosivesPermitDiffModal from "@common/components/explosivesPermits/ExplosivesPermitDiffModal";

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
  parentPermit: IExplosivesPermit;
  mine: IMine;
  title: string;
  closeModal: () => void;
  openDocument: (document_manager_guid: string, mine_document_guid: string) => void;
  handleOpenExplosivesPermitCloseModal: (event, record: IExplosivesPermit) => void;
}

const permitAmendmentLike = (permit: IExplosivesPermit): IExplosivesPermitAmendment => ({
  explosives_permit_amendment_id: undefined,
  explosives_permit_amendment_guid: undefined,
  ...permit,
});

export const ExplosivesPermitViewModal: FC<ExplosivesPermitViewModalProps> = (props) => {
  const { explosivesPermit, parentPermit, mine, title } = props;
  const amendmentsCount = parentPermit?.explosives_permit_amendments?.length || 0;

  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [currentPermit, setCurrentPermit] = useState<IExplosivesPermit>(explosivesPermit);
  const [openDiffModal, setOpenDiffModal] = useState(false);

  const permitHistoryColumns = [
    {
      title: "Issued",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (text) => <div>{formatDate(text)}</div>,
    },
    {
      title: "Expiry",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (text) => <div>{formatDate(text)}</div>,
    },
    {
      title: "Status",
      dataIndex: "is_closed",
      key: "is_closed",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Amendment",
      key: "amendment_order",
      dataIndex: "amendment_order",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "",
      key: "action",
      render: (text, record) => {
        const recordGuid = record.explosives_permit_guid || record.explosives_permit_amendment_guid;

        const currentPermitAsAmendment = permitAmendmentLike(currentPermit);

        if (
          recordGuid === currentPermitAsAmendment?.explosives_permit_guid ||
          recordGuid === currentPermitAsAmendment?.explosives_permit_amendment_guid
        )
          return null;
        return (
          <Button
            type="ghost"
            onClick={() => {
              const permit =
                parentPermit.explosives_permit_amendments.find(
                  (amendment) => amendment.explosives_permit_amendment_guid === recordGuid
                ) || parentPermit;
              setCurrentPermit(permit);
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  const transformPermitHistoryData = () => {
    const permitHistory = parentPermit.explosives_permit_amendments?.map((permit) => {
      return {
        ...permit,
        issue_date: permit.issue_date,
        expiry_date: permit.expiry_date,
        status: permit.is_closed ? "Closed" : "Open",
      };
    });
    permitHistory.unshift({
      ...permitAmendmentLike(parentPermit),
      issue_date: parentPermit.issue_date,
      expiry_date: parentPermit.expiry_date,
      status: parentPermit.is_closed ? "Closed" : "Open",
    });
    return permitHistory
      .map((amendment, index) => {
        return { ...amendment, amendment_order: index };
      })
      .reverse();
  };

  useEffect(() => {
    if (currentPermit) {
      const generatedTypes = ["LET", "PER"];
      const allDocs = [
        ...parentPermit?.documents,
        ...parentPermit?.explosives_permit_amendments
          .map((amendment) => amendment.documents)
          .flat(),
      ];
      setGeneratedDocs(
        allDocs.filter((doc) => generatedTypes.includes(doc.explosives_permit_document_type_code))
      );
      setSupportingDocs(
        allDocs.filter((doc) => !generatedTypes.includes(doc.explosives_permit_document_type_code))
      );
    }
  }, [currentPermit]);

  return (
    <div>
      {amendmentsCount > 0 && (
        <Alert
          className="esup-alert"
          message={`This Permit Contains ${amendmentsCount} Amended Version${
            amendmentsCount > 1 ? "s" : ""
          }`}
          description={
            <div>
              <Typography.Text>Click View History to See all past versions</Typography.Text>

              <Button
                type="primary"
                className="margin-large--left esup-history-button"
                onClick={() => setOpenDiffModal(true)}
              >
                View History
              </Button>
            </div>
          }
          type="info"
          showIcon
        />
      )}
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
                <Typography.Paragraph>{currentPermit.issue_date}</Typography.Paragraph>
              </Col>
              <Col span={12}>
                <Typography.Paragraph strong>Expiry Date</Typography.Paragraph>
                <Typography.Paragraph>{currentPermit.expiry_date}</Typography.Paragraph>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col span={24}>
                <Typography.Paragraph strong>Issuing Inspector</Typography.Paragraph>
                <Typography.Paragraph>{currentPermit.issuing_inspector_name}</Typography.Paragraph>
              </Col>
            </Row>
          </>

          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Explosives Permit Number</Typography.Paragraph>
              <Typography.Paragraph>{currentPermit.permit_number}</Typography.Paragraph>
            </Col>

            <Col span={12}>
              <Typography.Paragraph strong>Mines Act Permit</Typography.Paragraph>
              <Typography.Paragraph>example</Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Notice of Work Number</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.now_number}</Typography.Paragraph>
          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Mine Manager</Typography.Paragraph>
              <Typography.Paragraph>
                {currentPermit.mine_manager_mine_party_appt_id}
              </Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Permittee</Typography.Paragraph>
              <Typography.Paragraph>
                {currentPermit.permittee_mine_party_appt_id}
              </Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Application Date</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.application_date}</Typography.Paragraph>
          <Typography.Paragraph strong>Other Information</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.description}</Typography.Paragraph>
          <Typography.Title level={4} className="purple">
            Storage Details
          </Typography.Title>
          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Latitude</Typography.Paragraph>
              <Typography.Paragraph>{currentPermit?.latitude}</Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Longitude</Typography.Paragraph>
              <Typography.Paragraph>{currentPermit?.longitude}</Typography.Paragraph>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[currentPermit.latitude, currentPermit.longitude]} />
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
              <Col span={currentPermit.is_closed ? 12 : 24}>
                <Typography.Paragraph strong className="margin-none">
                  Permit Status
                </Typography.Paragraph>
              </Col>
              {currentPermit.is_closed && (
                <Col span={12}>
                  <Typography.Paragraph strong className="margin-none">
                    Date Closed
                  </Typography.Paragraph>
                </Col>
              )}
            </Row>
            <Row align="middle" justify="space-between">
              <Col span={currentPermit.is_closed ? 12 : 8}>
                <Typography.Paragraph className="margin-none">
                  {currentPermit.is_closed ? "Closed" : "Open"}
                </Typography.Paragraph>
              </Col>
              <Col span={currentPermit.is_closed ? 12 : 16}>
                {currentPermit.is_closed ? (
                  <Typography.Paragraph className="margin-none">
                    {formatDate(currentPermit.closed_timestamp)}
                  </Typography.Paragraph>
                ) : (
                  <Button
                    onClick={(event) =>
                      props.handleOpenExplosivesPermitCloseModal(event, currentPermit)
                    }
                    type="ghost"
                    className="close-permit-button"
                  >
                    Close Permit
                  </Button>
                )}
              </Col>
            </Row>
            {currentPermit.is_closed && (
              <Row className="margin-large--top">
                <Col span={24}>
                  <Typography.Paragraph>Reason for Closure</Typography.Paragraph>
                </Col>
                <Col span={24}>
                  <Typography.Paragraph>{currentPermit.closed_reason}</Typography.Paragraph>
                </Col>
              </Row>
            )}
            <Typography.Title level={4} className="purple margin-large--top">
              Explosives Magazines
            </Typography.Title>
            {currentPermit?.explosive_magazines?.length > 0 &&
              currentPermit.explosive_magazines.map((magazine, index) => (
                <Magazine
                  key={magazine.explosives_permit_magazine_id}
                  label={`Explosives Magazine ${index + 1}`}
                  magazine={magazine}
                />
              ))}
            <Typography.Title level={4} className="purple">
              Detonator Magazines
            </Typography.Title>
            {currentPermit?.detonator_magazines?.length > 0 &&
              currentPermit.detonator_magazines.map((magazine, index) => (
                <Magazine
                  key={magazine.explosives_permit_magazine_id}
                  label={`Detonator Magazine ${index + 1}`}
                  magazine={magazine}
                />
              ))}
            <Row align="middle" justify="space-between">
              <Col>
                <Typography.Title level={4} className="purple margin-none">
                  Permit History
                </Typography.Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  className="margin-large--left esup-history-button"
                  onClick={() => setOpenDiffModal(true)}
                >
                  View History
                </Button>
              </Col>
            </Row>
            <Table
              dataSource={transformPermitHistoryData()}
              pagination={false}
              columns={permitHistoryColumns}
            />
          </>
        </Col>
      </Row>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Button onClick={props.closeModal} className="full-mobile">
          Close
        </Button>
      </div>
      <ExplosivesPermitDiffModal
        open={openDiffModal}
        onCancel={() => setOpenDiffModal(false)}
        explosivesPermit={parentPermit}
      />
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
