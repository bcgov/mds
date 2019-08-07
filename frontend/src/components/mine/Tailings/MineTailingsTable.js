import React from "react";
import PropTypes from "prop-types";
import { Table, Icon, Popconfirm, Button } from "antd";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import LinkButton from "@/components/common/LinkButton";

const { errorRed } = COLOR;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  removeReport: PropTypes.func.isRequired,
  handleEditReportSubmit: PropTypes.func.isRequired,
};

const errorStyle = (isOverdue) => (isOverdue ? { color: errorRed } : {});

const columns = [
  {
    title: "",
    dataIndex: "overdue",
    width: 10,
    render: (text, record) => (
      <div title="">
        {record.isOverdue ? (
          <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
        ) : (
          ""
        )}
      </div>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    width: 200,
    render: (text, record) => (
      <div title="Name" style={errorStyle(record.isOverdue)}>
        {record.doc.exp_document_name}
      </div>
    ),
  },
  {
    title: "HSRC Code",
    dataIndex: "hsrc_code",
    width: 100,
    render: (text, record) => (
      <div title="Name" style={errorStyle(record.isOverdue)}>
        {record.doc.hsrc_code}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due",
    width: 90,
    render: (text, record) => (
      <div title="Due" style={errorStyle(record.isOverdue)}>
        {formatDate(record.doc.due_date) || "-"}
      </div>
    ),
  },
  {
    title: "Received",
    dataIndex: "received",
    width: 140,
    render: (text, record) => (
      <div title="Received" style={errorStyle(record.isOverdue)}>
        {" "}
        {formatDate(record.doc.received_date) || "-"}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    width: 120,
    render: (text, record) => (
      <div title="Status" style={errorStyle(record.isOverdue)}>
        {record.doc ? record.doc.expected_document_status.description : String.LOADING}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    width: 200,
    render: (text, record) => (
      <div title="Documents">
        {record.doc.related_documents.length === 0 ? (
          <span style={errorStyle(record.isOverdue)}>-</span>
        ) : (
          record.doc.related_documents.map((file) => (
            <div key={file.mine_document_guid}>
              <LinkButton
                key={file.mine_document_guid}
                onClick={() => downloadFileFromDocumentManager(file)}
              >
                {file.document_name}
              </LinkButton>
            </div>
          ))
        )}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "updateEdit",
    width: 10,
    render: (text, record) => (
      <div title="" align="right">
        <AuthorizationWrapper
          permission={Permission.EDIT_MINES}
          isMajorMine={record.mine.major_mine_ind}
        >
          <div className="inline-flex">
            <Button
              type="primary"
              size="small"
              ghost
              onClick={(event) =>
                record.openEditReportModal(
                  event,
                  record.handleEditReportSubmit,
                  ModalContent.EDIT_TAILINGS_REPORT,
                  record.doc
                )
              }
            >
              <img src={EDIT_OUTLINE_VIOLET} alt="Edit TSF Report" />
            </Button>
            <Popconfirm
              placement="topLeft"
              title={`Are you sure you want to delete ${record.doc.exp_document_name}?`}
              onConfirm={(event) => record.removeReport(event, record.doc.exp_document_guid)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button ghost type="primary" size="small">
                <Icon type="minus-circle" theme="outlined" />
              </Button>
            </Popconfirm>
          </div>
        </AuthorizationWrapper>
      </div>
    ),
  },
];

const byDate = (doc1, doc2) =>
  !(Date.parse(doc1.due_date) === Date.parse(doc2.due_date))
    ? Date.parse(doc1.due_date) - Date.parse(doc2.due_date)
    : doc1.exp_document_name - doc2.exp_document_name;

const transformRowData = (mine, actions) =>
  mine.mine_expected_documents.sort(byDate).map((doc) => ({
    key: doc.exp_document_guid,
    doc,
    mine,
    isOverdue:
      Date.parse(doc.due_date) < new Date() &&
      doc.expected_document_status.exp_document_status_code === "MIA",
    ...actions,
  }));

const MineTailingsTable = (props) => (
  <div className="mine-info-padding">
    {props.mine && (
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformRowData(props.mine, {
          openEditReportModal: props.openEditReportModal,
          handleEditReportSubmit: props.handleEditReportSubmit,
          removeReport: props.removeReport,
        })}
      />
    )}
  </div>
);

MineTailingsTable.propTypes = propTypes;

export default MineTailingsTable;
