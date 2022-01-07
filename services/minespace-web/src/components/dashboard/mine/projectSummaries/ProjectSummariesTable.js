import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Table, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import * as routes from "@/constants/routes";
import { EDIT_PENCIL } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export class ProjectSummariesTable extends Component {
  transformRowData = (projectSummaries, codeHash, handleDeleteDraft) =>
    projectSummaries &&
    projectSummaries.map((projectSummary) => ({
      key: projectSummary.project_summary_guid,
      projectSummary,
      mine_guid: projectSummary.mine_guid,
      project_summary_guid: projectSummary.project_summary_guid,
      project_summary_id: projectSummary.project_summary_id,
      status_code: codeHash[projectSummary.status_code],
      update_user: projectSummary.update_user,
      update_timestamp: formatDate(projectSummary.update_timestamp),
      documents: projectSummary.documents,
      handleDeleteDraft: handleDeleteDraft,
    }));

  columns = () => [
    {
      title: "Project #",
      dataIndex: "project_summary_id",
      sorter: (a, b) => (a.project_summary_id > b.project_summary_id ? -1 : 1),
      render: (text) => <div title="Project Description No.">{text}</div>,
    },
    {
      title: "Last Updated",
      dataIndex: "update_timestamp",
      sorter: dateSorter("update_timestamp"),
      render: (text) => <div title="Last Updated">{text}</div>,
    },
    {
      title: "Last Updated By",
      dataIndex: "update_user",
      render: (text) => <div title="Last Updated By">{text}</div>,
      sorter: (a, b) => (a.update_user > b.update_user ? -1 : 1),
    },
    {
      title: "Status",
      dataIndex: "status_code",
      render: (text) => <div title="Status">{text}</div>,
      sorter: (a, b) => (a.status_code > b.status_code ? -1 : 1),
    },
    {
      title: "Files",
      dataIndex: "documents",
      render: (text, record) => {
        return (
          <div title="Documents" className="cap-col-height">
            {record.documents.length > 0
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid}>
                    <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(file)}>
                      {truncateFilename(file.document_name)}
                    </LinkButton>
                  </div>
                ))
              : Strings.EMPTY_FIELD}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "projectSummary",
      render: (text, record) => (
        <div title="" align="right">
          <Link
            to={routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
              record.mine_guid,
              record.project_summary_guid
            )}
          >
            <img src={EDIT_PENCIL} alt="Edit" />
          </Link>
          {record.status_code === "Draft" && (
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to delete this draft?"
              onConfirm={(e) => record.handleDeleteDraft(e, record.project_summary_guid)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button type="primary" size="small" ghost>
                <DeleteOutlined className="padding-sm--left icon-sm" />
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  render() {
    return (
      <Table
        size="small"
        pagination={false}
        loading={!this.props.isLoaded}
        columns={this.columns()}
        dataSource={this.transformRowData(
          this.props.projectSummaries,
          this.props.projectSummaryStatusCodesHash,
          this.props.handleDeleteDraft
        )}
        locale={{ emptyText: "This mine has no project description data." }}
      />
    );
  }
}

ProjectSummariesTable.propTypes = propTypes;

export default ProjectSummariesTable;
