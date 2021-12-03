import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Table } from "antd";
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
  transformRowData = (projectSummaries, codeHash) =>
    projectSummaries &&
    projectSummaries.map((projectSummary) => ({
      key: projectSummary.project_summary_guid,
      projectSummary,
      mine_guid: projectSummary.mine_guid,
      project_summary_guid: projectSummary.project_summary_guid,
      project_summary_id: projectSummary.project_summary_id,
      status_code: codeHash[projectSummary.status_code],
      updated_by: projectSummary.updated_by,
      updated_timestamp: formatDate(projectSummary.updated_timestamp),
      documents: projectSummary.documents,
    }));

  columns = () => [
    {
      title: "Project #",
      dataIndex: "project_summary_id",
      sorter: (a, b) => (a.project_summary_id > b.project_summary_id ? -1 : 1),
      render: (text) => <div title="Project Summary No.">{text}</div>,
    },
    {
      title: "Last Updated",
      dataIndex: "updated_timestamp",
      sorter: dateSorter("updated_timestamp"),
      render: (text) => <div title="Last Updated">{text}</div>,
    },
    {
      title: "Last Updated By",
      dataIndex: "updated_by",
      render: (text) => <div title="Last Updated By">{text}</div>,
      sorter: (a, b) => (a.updated_by > b.updated_by ? -1 : 1),
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
          this.props.projectSummaryStatusCodesHash
        )}
        locale={{ emptyText: "This mine has no project summary data." }}
      />
    );
  }
}

ProjectSummariesTable.propTypes = propTypes;

export default ProjectSummariesTable;
