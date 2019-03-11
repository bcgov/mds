import React from "react";
import PropTypes from "prop-types";
import { Table, Icon, Popconfirm, Button } from "antd";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import { BRAND_PENCIL, RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  removeReport: PropTypes.func.isRequired,
  handleEditReportSubmit: PropTypes.func.isRequired,
};

const columns = [
  {
    title: "",
    dataIndex: "overdue",
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
    render: (text, record) => (
      <div title="Name">
        <h6>{record.doc.exp_document_name}</h6>
      </div>
    ),
  },
  {
    title: "Due",
    dataIndex: "due",
    render: (text, record) => (
      <div title="Due">
        <h6>{formatDate(record.doc.due_date) || "-"}</h6>
      </div>
    ),
  },
  {
    title: "Received",
    dataIndex: "received",
    render: (text, record) => (
      <div title="Received">
        <h6>{formatDate(record.doc.received_date) || "-"}</h6>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (text, record) => (
      <div title="Status">
        <h6 className={record.isOverdue ? "bold" : null}>
          {record.doc ? record.doc.exp_document_status.description : String.LOADING}
        </h6>
      </div>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) => (
      <div title="Documents">
        {!record.doc.related_documents
          ? "-"
          : record.doc.related_documents.map((file) => (
              <div>
                <a
                  role="link"
                  key={file.mine_document_guid}
                  onClick={() =>
                    downloadFileFromDocumentManager(file.document_manager_guid, file.document_name)
                  }
                  // Accessibility: Event listener
                  onKeyPress={() =>
                    downloadFileFromDocumentManager(file.document_manager_guid, file.document_name)
                  }
                  // Accessibility: Focusable element
                  tabIndex="0"
                >
                  {file.document_name}
                </a>
              </div>
            ))}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "updateEdit",
    render: (text, record) => (
      <div title="" align="right">
        <AuthorizationWrapper
          permission={Permission.CREATE}
          isMajorMine={record.mine.major_mine_ind}
        >
          <div className="inline-flex">
            <Button
              className="full-mobile"
              type="primary"
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
              <img src={BRAND_PENCIL} alt="Edit TSF Report" />
            </Button>
            <Popconfirm
              placement="topLeft"
              title={`Are you sure you want to delete ${record.doc.exp_document_name}?`}
              onConfirm={(event) => record.removeReport(event, record.doc.exp_document_guid)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button className="full-mobile" ghost type="primary">
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
      doc.exp_document_status.exp_document_status_code === "MIA",
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
