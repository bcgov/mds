import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { Table, Icon, Button } from "antd";

import CustomPropTypes from "@/customPropTypes";
import { RED_CLOCK } from "@/constants/assets";
import * as ModalContent from "@/constants/modalContent";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import { formatDate } from "@/utils/helpers";

const { errorRed } = COLOR;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReportSubmit: PropTypes.func.isRequired,
};

const columns = [
  {
    title: "",
    dataIndex: "overdue",
    render: (text, record) =>
      record.isOverdue ? (
        <div title="">
          <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
        </div>
      ) : (
        ""
      ),
  },
  {
    title: "Name",
    dataIndex: "name",
    render: (text, record) => (
      <div title="Name" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.doc.exp_document_name}
      </div>
    ),
  },
  {
    title: "HSRC Code",
    dataIndex: "hsrc_code",
    render: (text, record) => (
      <div title="Name" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.doc.hsrc_code || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due",
    render: (text, record) => (
      <div title="Due" style={record.isOverdue ? { color: errorRed } : {}}>
        {formatDate(record.doc.due_date) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Received Date",
    dataIndex: "receivedDate",
    render: (text, record) => (
      <div title="Received Date">{formatDate(record.doc.received_date) || Strings.EMPTY_FIELD}</div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (test, record) => (
      <div title="Status" style={record.isOverdue ? { color: errorRed } : {}}>
        {record.doc ? record.doc.expected_document_status.description : Strings.LOADING}
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) => (
      <div title="Documents">
        <ul>
          {!record.doc.related_documents || record.doc.related_documents.length === 0
            ? Strings.EMPTY_FIELD
            : record.doc.related_documents.map((file) => (
                <li className="wrapped-text">
                  <a
                    role="link"
                    key={file.mine_document_guid}
                    onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                    // Accessibility: Event listener
                    onKeyPress={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                    // Accessibility: Focusable element
                    tabIndex="0"
                  >
                    {file.document_name}
                  </a>
                </li>
              ))}
        </ul>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "upload",
    render: (text, record) => (
      <div title="">
        <Button
          className="full-mobile"
          type="primary"
          ghost
          onClick={(event) =>
            record.openEditReportModal(
              event,
              record.handleEditReportSubmit,
              ModalContent.EDIT_REPORT(
                record.doc.exp_document_name,
                moment()
                  .subtract(1, "year")
                  .year()
              ),
              record.doc
            )
          }
        >
          <Icon type="file-add" /> Upload/Edit
        </Button>
      </div>
    ),
  },
];

const byDate = (doc1, doc2) =>
  !(Date.parse(doc1.due_date) === Date.parse(doc2.due_date))
    ? Date.parse(doc1.due_date) - Date.parse(doc2.due_date)
    : doc1.exp_document_name - doc2.exp_document_name;

const transformRowData = (expectedDocuments, actions) =>
  expectedDocuments.sort(byDate).map((doc) => ({
    key: doc.exp_document_guid,
    doc,
    isOverdue:
      Date.parse(doc.due_date) < new Date() &&
      doc.expected_document_status.exp_document_status_code === "MIA",
    ...actions,
  }));

const MineReportTable = (props) => (
  <div className="mine-info-padding">
    {props.mine && (
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformRowData(props.mine.mine_expected_documents, {
          openEditReportModal: props.openEditReportModal,
          handleEditReportSubmit: props.handleEditReportSubmit,
        })}
      />
    )}
  </div>
);

MineReportTable.propTypes = propTypes;

export default MineReportTable;
