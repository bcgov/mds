import "@ant-design/compatible/assets/index.css";

import { Alert, Button, Col, Row, Table, Typography } from "antd";
import {
  ESUP_DOCUMENT_GENERATED_TYPES,
  IExplosivesPermit,
  IExplosivesPermitAmendment,
} from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { bindActionCreators } from "redux";

import ExplosivesPermitDiffModal from "@mds/common/components/explosivespermits/ExplosivesPermitDiffModal";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { formatDate } from "@mds/common/redux/utils/helpers";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";
import Magazine from "@mds/common/components/explosivespermits/Magazine";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { renderCategoryColumn, renderTextColumn } from "../common/CoreTableCommonColumns";

export const generatedDocColumns = [
  renderCategoryColumn(
    "explosives_permit_document_type_code",
    "Category",
    ESUP_DOCUMENT_GENERATED_TYPES,
    true,
    "",
    "break-word"
  ),
  {
    title: "File Name",
    dataIndex: "document_name",
    key: "document_name",
    render: (text, record) => (
      <Typography.Link
        className="break-word"
        onClick={() => downloadFileFromDocumentManager(record)}
      >
        {text}
      </Typography.Link>
    ),
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
    render: (text, record) => (
      <Typography.Link
        className="break-word"
        onClick={() => downloadFileFromDocumentManager(record)}
      >
        {text}
      </Typography.Link>
    ),
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
  explosivesPermit: IExplosivesPermitAmendment;
  parentPermit: IExplosivesPermit;
  closeModal: () => void;
  openAmendModal?: (event, record: IExplosivesPermit) => void;
  handleOpenExplosivesPermitCloseModal: (event, record: IExplosivesPermit) => void;
}

const permitAmendmentLike = (permit: IExplosivesPermit): IExplosivesPermitAmendment => ({
  explosives_permit_amendment_id: undefined,
  explosives_permit_amendment_guid: undefined,
  ...permit,
});

export const ExplosivesPermitViewModal: FC<ExplosivesPermitViewModalProps> = (props) => {
  const { explosivesPermit, parentPermit } = props;
  const amendmentsCount = parentPermit?.amendment_count || 0;
  const { explosivesPermitGuid } = useParams<{
    explosivesPermitGuid: string;
  }>();

  const isCore = !explosivesPermitGuid;

  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [currentPermit, setCurrentPermit] = useState<IExplosivesPermitAmendment>(explosivesPermit);
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
    renderCategoryColumn("is_closed", "Status", { true: "Closed", false: "Open" }),
    renderTextColumn("amendment_no", "Amendment"),
    {
      title: "",
      key: "action",
      render: (record) => {
        const amendmentId = record.explosives_permit_amendment_id;
        if (amendmentId === currentPermit?.explosives_permit_amendment_id) {
          return null;
        }
        return (
          <Button
            type="ghost"
            onClick={() => {
              const permit =
                parentPermit.explosives_permit_amendments.find(
                  (amendment) => amendment.explosives_permit_amendment_id === amendmentId
                ) || parentPermit;
              setCurrentPermit(permit as IExplosivesPermitAmendment);
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  const transformPermitHistoryData = () => {
    const permitHistory: any[] = [
      permitAmendmentLike(parentPermit),
      ...parentPermit?.explosives_permit_amendments?.sort(
        (a, b) => a.explosives_permit_amendment_id - b.explosives_permit_amendment_id
      ),
    ];

    return permitHistory.reverse();
  };

  useEffect(() => {
    if (currentPermit) {
      const generatedTypes = Object.keys(ESUP_DOCUMENT_GENERATED_TYPES);
      const permitDocuments = parentPermit?.documents ?? [];
      const amendmentDocuments =
        parentPermit?.explosives_permit_amendments?.map((amendment) => amendment.documents) ?? [];
      // Wrapping in another array to flatten only if it's not undefined
      const allDocs = [...permitDocuments, ...[].concat(...amendmentDocuments)];

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
        <>
          <Alert
            className="ant-alert-grey bullet"
            message={`This Permit Contains ${amendmentsCount} Amended Version${
              amendmentsCount > 1 ? "s" : ""
            }`}
            description={
              <div>
                <Typography.Text>Click View History to See all past versions</Typography.Text>

                <Button className="margin-large--left" onClick={() => setOpenDiffModal(true)}>
                  View History
                </Button>
              </div>
            }
            type="info"
            showIcon
          />
          <br />
        </>
      )}
      {isCore && (
        <Typography.Title level={2} className="margin-large--bottom">
          Explosive Storage and Use Permit
        </Typography.Title>
      )}
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Typography.Title level={3} className="primary-colour">
            Explosives Permit Details
          </Typography.Title>
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
                <Typography.Paragraph>
                  {currentPermit.issuing_inspector_name || parentPermit.issuing_inspector_name}
                </Typography.Paragraph>
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
              <Typography.Paragraph>{currentPermit.mines_permit_number}</Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Notice of Work Number</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.now_number}</Typography.Paragraph>
          <Row gutter={6}>
            <Col span={12}>
              <Typography.Paragraph strong>Mine Manager</Typography.Paragraph>
              <Typography.Paragraph>{currentPermit.mine_manager_name}</Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Permittee</Typography.Paragraph>
              <Typography.Paragraph>{currentPermit.permittee_name}</Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Application Date</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.application_date}</Typography.Paragraph>
          <Typography.Paragraph strong>Other Information</Typography.Paragraph>
          <Typography.Paragraph>{currentPermit.description}</Typography.Paragraph>
          <Typography.Title level={3} className="primary-colour">
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
          {(supportingDocs.length > 0 || generatedDocs.length > 0) && (
            <Row>
              <Typography.Title level={3} className="primary-colour">
                Supporting Documents
              </Typography.Title>
              {generatedDocs.length > 0 && (
                <>
                  <Col span={24}>
                    <Typography.Title level={4} className="dark-grey">
                      Permit Documents
                    </Typography.Title>
                    <Typography.Paragraph>
                      These documents were generated when this version of the permit was created.
                      These documents will be viewable by Minespace users
                    </Typography.Paragraph>
                  </Col>
                  <Col span={24}>
                    <Table
                      sticky={true}
                      dataSource={generatedDocs}
                      pagination={false}
                      columns={generatedDocColumns}
                    />
                  </Col>
                </>
              )}
              {supportingDocs.length > 0 && (
                <>
                  <Col span={24}>
                    <br />
                    <Typography.Title level={4} className="dark-grey">
                      Uploaded Documents
                    </Typography.Title>
                    <Typography.Paragraph>
                      Documents uploaded here will be viewable by Minespace users
                    </Typography.Paragraph>
                  </Col>
                  <Col span={24}>
                    <Table
                      dataSource={supportingDocs}
                      pagination={false}
                      columns={supportingDocColumns}
                    />
                  </Col>
                </>
              )}
            </Row>
          )}
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <>
            <Typography.Title level={3} className="primary-colour">
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
              {isCore && (
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
              )}
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
            <Typography.Title level={3} className="primary-colour margin-large--top">
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
            <Typography.Title level={3} className="primary-colour">
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
                <Typography.Title level={3} className="purple margin-none">
                  Permit History
                </Typography.Title>
              </Col>
              <Col>
                <Button
                  type="ghost"
                  className="margin-large--left"
                  onClick={() => setOpenDiffModal(true)}
                >
                  View History
                </Button>
              </Col>
            </Row>
            <Table
              rowKey={(rec) => rec.explosives_permit_amendment_guid ?? rec.explosives_permit_guid}
              dataSource={transformPermitHistoryData()}
              pagination={false}
              columns={permitHistoryColumns}
            />
          </>
        </Col>
      </Row>
      {isCore && (
        <div>
          <Row className="flex-between form-button-container-row">
            {explosivesPermit.application_status === "APP" && (
              <Button
                onClick={(event) => props.openAmendModal(event, explosivesPermit)}
                className="full-mobile"
                type="ghost"
              >
                Create Amendment
              </Button>
            )}
            <Button
              onClick={props.closeModal}
              className="full-mobile"
              type="primary"
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
          </Row>
        </div>
      )}
      <ExplosivesPermitDiffModal
        open={openDiffModal}
        onCancel={() => setOpenDiffModal(false)}
        explosivesPermit={parentPermit}
      />
    </div>
  );
};

export default ExplosivesPermitViewModal;
